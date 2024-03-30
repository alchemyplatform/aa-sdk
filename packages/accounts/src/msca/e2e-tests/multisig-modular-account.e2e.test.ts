import {
  LocalAccountSigner,
  LogLevel,
  Logger,
  sepolia,
  wrapSignatureWith6492,
  parseFactoryAddressFromAccountInitCode,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
} from "@alchemy/aa-core";
import {
  http,
  type Address,
  type Chain,
  type HDAccount,
  createPublicClient,
} from "viem";
import { createMultisigModularAccountClient } from "../client.js";
import { formatSignatures } from "../plugins/multisig/index.js";
import { API_KEY, OWNER_MNEMONIC } from "./constants.js";

const chain = sepolia;

Logger.setLogLevel(LogLevel.DEBUG);

describe("Multisig Modular Account Tests", async () => {
  const signer1: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC, {
      accountIndex: 0,
    });

  const signer2: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC, {
      accountIndex: 1,
    });

  const signer3: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC, {
      accountIndex: 2,
    });

  const threshold = 2n;

  const owners = [
    await signer1.getAddress(),
    await signer2.getAddress(),
    await signer3.getAddress(),
  ];

  // todo: 1271 signature verification

  it("should successfully get counterfactual address", async () => {
    const {
      account: { address },
    } = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold,
    });
    expect(address).toMatchInlineSnapshot(
      '"0x4ff93F25764CefC22aeeE111CEf47CD1B5e05370"'
    );
  });

  it("should get on-chain owner address successfully", async () => {
    const provider = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold,
    });

    // .map(...) just to generate a non-readonly copy
    expect((await provider.readOwners()).slice().sort()).toMatchInlineSnapshot(
      owners.slice().sort()
    );

    expect(await provider.getThreshold({ account: provider.account })).toBe(
      threshold
    );
  });

  it("should correctly verify 1271 signatures over messages", async () => {
    const provider1 = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold,
    });
    const provider2 = await givenConnectedProvider({
      signer: signer2,
      chain,
      owners,
      threshold,
    });
    const message = "test";

    const signature1 = await provider1.account.signMessage({ message });

    // console.log("signature1: ", signature1);

    const signature2 = await provider2.account.signMessage({ message });

    // console.log("signature2: ", signature2);

    const combined = formatSignatures([
      {
        userOpSigType: "ACTUAL",
        signerType: "EOA",
        signature: signature1,
        signer: await signer1.getAddress(),
      },
      {
        userOpSigType: "ACTUAL",
        signerType: "EOA",
        signature: signature2,
        signer: await signer2.getAddress(),
      },
    ]);

    // console.log("combined: ", combined);

    expect(
      await provider1.verifyMessage({
        address: provider1.getAddress(),
        message,
        signature: combined,
      })
    ).toBe(true);
  });

  it("should correctly verify 1271 signatures over typed data", async () => {
    const provider1 = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold,
    });
    const provider2 = await givenConnectedProvider({
      signer: signer2,
      chain,
      owners,
      threshold,
    });

    const types = {
      Request: [{ name: "hello", type: "string" }],
    };

    const primaryType = "Request";

    const message = {
      hello: "world",
    };

    const signature1 = await provider1.account.signTypedDataWith6492({
      types,
      primaryType,
      message,
    });

    // console.log("signature1: ", signature1);

    const signature2 = await provider2.account.signTypedDataWith6492({
      types,
      primaryType,
      message,
    });

    // console.log("signature2: ", signature2);

    const combined = formatSignatures([
      {
        userOpSigType: "ACTUAL",
        signerType: "EOA",
        signature: signature1,
        signer: await signer1.getAddress(),
      },
      {
        userOpSigType: "ACTUAL",
        signerType: "EOA",
        signature: signature2,
        signer: await signer2.getAddress(),
      },
    ]);

    // console.log("combined: ", combined);

    expect(
      await provider1.verifyTypedData({
        address: provider1.getAddress(),
        types,
        primaryType,
        message,
        signature: combined,
      })
    ).toBe(true);
  });

  it("should correctly verify 1271 signatures over typed data for an undeployed account", async () => {
    // Add a fourth signer to change the counterfactual (not yet deployed)

    const signer4: SmartAccountSigner<HDAccount> =
      LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC, {
        accountIndex: 3,
      });

    const provider1 = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners: [...owners, await signer4.getAddress()],
      threshold,
    });
    const provider2 = await givenConnectedProvider({
      signer: signer2,
      chain,
      owners: [...owners, await signer4.getAddress()],
      threshold,
    });

    const {
      account: { address },
    } = provider1;
    expect(address).toEqual("0xB77423329491BAF4b7B904887627C55Cd53968f8");

    const types = {
      Request: [{ name: "hello", type: "string" }],
    };

    const primaryType = "Request";

    const message = {
      hello: "world",
    };

    const signature1 = await provider1.account.signTypedData({
      types,
      primaryType,
      message,
    });

    // console.log("signature1: ", signature1);

    const signature2 = await provider2.account.signTypedData({
      types,
      primaryType,
      message,
    });

    // console.log("signature2: ", signature2);

    const combined = formatSignatures([
      {
        userOpSigType: "ACTUAL",
        signerType: "EOA",
        signature: signature1,
        signer: await signer1.getAddress(),
      },
      {
        userOpSigType: "ACTUAL",
        signerType: "EOA",
        signature: signature2,
        signer: await signer2.getAddress(),
      },
    ]);

    // console.log("combined: ", combined);

    const [, factoryCalldata] = parseFactoryAddressFromAccountInitCode(
      await provider1.account.getInitCode()
    );

    const wrappedSig = wrapSignatureWith6492({
      factoryAddress: provider1.account.getFactoryAddress(),
      factoryCalldata,
      signature: combined,
    });

    // todo: can we override verifyMessage & verifyTypedData to internally only use the public client, to prevent the EIP-684 issue?
    const publicClient = createPublicClient({
      transport: http(`${chain.rpcUrls.alchemy.http[0]}/${API_KEY!}`),
      chain,
    });

    expect(
      await publicClient.verifyTypedData({
        address: provider1.getAddress(),
        types,
        primaryType,
        message,
        signature: wrappedSig,
      })
    ).toBe(true);
  });

  it.skip("should execute successfully", async () => {
    const initiator = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold,
    });

    const submitter = await givenConnectedProvider({
      signer: signer2,
      chain,
      owners,
      threshold,
    });

    expect(initiator.getAddress()).toBe(submitter.getAddress());

    const { aggregatedSignature } = await initiator.proposeUserOperation({
      uo: {
        target: initiator.getAddress(),
        data: "0x",
      },
    });

    const result = await submitter.sendUserOperation({
      uo: {
        target: initiator.getAddress(),
        data: "0x",
      },
      context: {
        signature: aggregatedSignature,
      },
    });

    const txnHash = submitter.waitForUserOperationTransaction({
      hash: result.hash,
    });

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it.skip("should execute successfully with actual gas values equal to max gas values", async () => {
    const initiator = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold,
    });

    const submitter = await givenConnectedProvider({
      signer: signer2,
      chain,
      owners,
      threshold,
    });

    expect(initiator.getAddress()).toBe(submitter.getAddress());

    const { aggregatedSignature, request: userOpReq } =
      await initiator.proposeUserOperation({
        uo: {
          target: initiator.getAddress(),
          data: "0x",
        },
        overrides: {
          maxFeePerGas: { multiplier: 2 },
          maxPriorityFeePerGas: { multiplier: 3 },
          preVerificationGas: { multiplier: 1.5 },
        },
      });

    const result = await submitter.sendUserOperation({
      uo: {
        target: initiator.getAddress(),
        data: "0x",
      },
      context: {
        signature: aggregatedSignature,
      },
      overrides: {
        callGasLimit: userOpReq.callGasLimit,
        verificationGasLimit: userOpReq.verificationGasLimit,
        preVerificationGas: userOpReq.preVerificationGas,
        maxFeePerGas: userOpReq.maxFeePerGas,
        maxPriorityFeePerGas: userOpReq.maxPriorityFeePerGas,
      },
    });

    const txnHash = submitter.waitForUserOperationTransaction({
      hash: result.hash,
    });

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  // todo: 3/3 account, use the "middle" signature generating function too.
});

const givenConnectedProvider = async ({
  signer,
  chain,
  accountAddress,
  feeOptions,
  owners,
  threshold,
}: {
  signer: SmartAccountSigner;
  chain: Chain;
  accountAddress?: Address;
  feeOptions?: UserOperationFeeOptions;
  owners: Address[];
  threshold: bigint;
}) => {
  return createMultisigModularAccountClient({
    transport: http(`${chain.rpcUrls.alchemy.http[0]}/${API_KEY!}`),
    chain: chain,
    account: {
      signer,
      accountAddress,
      owners,
      threshold,
    },
    opts: {
      feeOptions: {
        ...feeOptions,
        maxFeePerGas: { multiplier: 1.5 },
        maxPriorityFeePerGas: { multiplier: 1.5 },
      },
      txMaxRetries: 100,
    },
  });
};
