import {
  LocalAccountSigner,
  LogLevel,
  Logger,
  parseFactoryAddressFromAccountInitCode,
  sepolia,
  wrapSignatureWith6492,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
} from "@aa-sdk/core";
import {
  createPublicClient,
  fromHex,
  http,
  pad,
  type Address,
  type Chain,
  type HDAccount,
} from "viem";
import { createMultisigModularAccountClient } from "../client/client.js";
import { formatSignatures } from "../plugins/multisig/utils/index.js";
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
      '"0xB717003B9777B894000B89d60B179FDA96a655D3"',
    );
  });

  it("should get on-chain owner address successfully", async () => {
    const provider = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold,
    });

    expect((await provider.readOwners()).slice().sort()).toStrictEqual(
      owners.slice().sort(),
    );

    expect(await provider.getThreshold({})).toBe(threshold);
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

    const signature2 = await provider2.account.signMessage({ message });

    const combined = formatSignatures(
      [
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
      ],
      true,
    );

    expect(
      await provider1.verifyMessage({
        address: provider1.getAddress(),
        message,
        signature: combined,
      }),
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

    const signature2 = await provider2.account.signTypedDataWith6492({
      types,
      primaryType,
      message,
    });

    const combined = formatSignatures(
      [
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
      ],
      true,
    );

    expect(
      await provider1.verifyTypedData({
        address: provider1.getAddress(),
        types,
        primaryType,
        message,
        signature: combined,
      }),
    ).toBe(true);
  });

  it("should correctly sign and verify 6492 signatures over messages for an undeployed account", async () => {
    // Add a fourth signer to change the counterfactual (not yet deployed)

    const signer4: SmartAccountSigner<HDAccount> =
      LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC, {
        accountIndex: 3,
      });

    const moreOwners = [...owners, await signer4.getAddress()];

    const provider1 = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners: moreOwners,
      threshold,
    });
    const provider2 = await givenConnectedProvider({
      signer: signer2,
      chain,
      owners: moreOwners,
      threshold,
    });

    const {
      account: { address },
    } = provider1;
    expect(address).toMatchInlineSnapshot(
      '"0xD605446440A7d09772C909263823189377A503Da"',
    );

    const message = "test";

    const signature1 = await provider1.account.signMessage({ message });

    const signature2 = await provider2.account.signMessage({ message });

    const combined = formatSignatures(
      [
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
      ],
      true,
    );

    const [, factoryCalldata] = parseFactoryAddressFromAccountInitCode(
      await provider1.account.getInitCode(),
    );

    const wrappedSig = wrapSignatureWith6492({
      factoryAddress: await provider1.account.getFactoryAddress(),
      factoryCalldata,
      signature: combined,
    });

    // todo: can we override verifyMessage & verifyTypedData to internally only use the public client, to prevent the EIP-684 issue?
    const publicClient = createPublicClient({
      transport: http(`${chain.rpcUrls.alchemy.http[0]}/${API_KEY!}`),
      chain,
    });

    expect(
      await publicClient.verifyMessage({
        address: provider1.getAddress(),
        message,
        signature: wrappedSig,
      }),
    ).toBe(true);
  });

  it("should correctly sign and verify 6492 signatures over typed data for an undeployed account", async () => {
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
    expect(address).toMatchInlineSnapshot(
      '"0xD605446440A7d09772C909263823189377A503Da"',
    );

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

    const signature2 = await provider2.account.signTypedData({
      types,
      primaryType,
      message,
    });

    const combined = formatSignatures(
      [
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
      ],
      true,
    );

    const [, factoryCalldata] = parseFactoryAddressFromAccountInitCode(
      await provider1.account.getInitCode(),
    );

    const wrappedSig = wrapSignatureWith6492({
      factoryAddress: await provider1.account.getFactoryAddress(),
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
      }),
    ).toBe(true);
  });

  it("should execute successfully", async () => {
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

    const { aggregatedSignature, signatureObj } =
      await initiator.proposeUserOperation({
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
        aggregatedSignature: aggregatedSignature,
        signatures: [signatureObj],
        userOpSignatureType: "ACTUAL",
      },
    });

    const txnHash = submitter.waitForUserOperationTransaction({
      hash: result.hash,
    });

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should execute successfully when using sendTransaction", async () => {
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

    const { aggregatedSignature, signatureObj } =
      await initiator.proposeUserOperation({
        uo: {
          target: initiator.getAddress(),
          data: "0x",
        },
      });

    const result = submitter.sendTransaction(
      {
        to: initiator.getAddress(),
        data: "0x",
      },
      undefined,
      {
        aggregatedSignature: aggregatedSignature,
        signatures: [signatureObj],
        userOpSignatureType: "ACTUAL",
      },
    );

    await expect(result).resolves.not.toThrowError();
  }, 100000);

  it("should execute successfully with actual gas values equal to max gas values", async () => {
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

    const {
      aggregatedSignature,
      request: userOpReq,
      signatureObj,
    } = await initiator.proposeUserOperation({
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
        signatures: [signatureObj],
        aggregatedSignature,
        userOpSignatureType: "ACTUAL",
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

  it("should execute successfully with 3/3 signers", async () => {
    const higherThreshold = 3n;

    const provider1 = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold: higherThreshold,
    });
    const provider2 = await givenConnectedProvider({
      signer: signer2,
      chain,
      owners,
      threshold: higherThreshold,
    });
    const provider3 = await givenConnectedProvider({
      signer: signer3,
      chain,
      owners,
      threshold: higherThreshold,
    });

    const {
      account: { address },
    } = provider1;
    expect(address).toMatchInlineSnapshot(
      '"0xF2dBBB10E1a7406B17B0056357132B0702e184D5"',
    );

    const { request, signatureObj: signature1 } =
      await provider1.proposeUserOperation({
        uo: {
          target: provider1.getAddress(),
          data: "0x",
        },
      });

    const { aggregatedSignature, signatureObj: signature2 } =
      await provider2.signMultisigUserOperation({
        account: provider2.account,
        signatures: [signature1],
        userOperationRequest: request,
      });

    // parse the UO request fields into the override format to send to sendUserOperation
    // todo: helper function to go from UserOperationRequest to SendUserOperationParams?

    const result = await provider3.sendUserOperation({
      uo: request.callData,
      overrides: {
        callGasLimit: request.callGasLimit,
        verificationGasLimit: request.verificationGasLimit,
        nonceKey: fromHex(`0x${pad(request.nonce).slice(2, 26)}`, "bigint"), // Nonce key is the first 24 bytes of the nonce
      },
      context: {
        aggregatedSignature,
        signatures: [signature1, signature2],
        userOpSignatureType: "ACTUAL",
      },
    });

    const txnHash = provider3.waitForUserOperationTransaction({
      hash: result.hash,
    });

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);
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
    transport: http(`${chain.rpcUrls.alchemy.http[0]}/${API_KEY!}`, {
      retryCount: 0,
    }),
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
        preVerificationGas: { multiplier: 1.5 },
      },
      txMaxRetries: 100,
    },
  });
};
