import { LocalAccountSigner, sepolia } from "@aa-sdk/core";
import { fromHex, pad } from "viem";
import {
  createMultisigAccountAlchemyClient,
  type AlchemyMultisigAccountClientConfig,
} from "../src/index.js";
import {
  API_KEY,
  MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
  PAYMASTER_POLICY_ID,
} from "./constants.js";

const chain = sepolia;

describe("Multisig Modular Account Alchemy Client Tests", async () => {
  const signer1 = LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 0 }
  );

  const signer2 = LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 1 }
  );

  const signer3 = LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 2 }
  );

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
      '"0xea78315aec5Ff47bF320843A1BaA769C99c8Ae32"'
    );
  });

  it("should get on-chain owner address successfully", async () => {
    const provider = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold,
    });

    expect((await provider.readOwners()).slice().sort()).toMatchInlineSnapshot(
      owners.slice().sort()
    );

    expect(await provider.getThreshold({ account: provider.account })).toBe(
      threshold
    );
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
        aggregatedSignature,
        signatures: [signatureObj],
        userOpSignatureType: "ACTUAL",
      },
    });

    const txnHash = submitter.waitForUserOperationTransaction({
      hash: result.hash,
    });

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should successfully execute with alchemy paymaster info", async () => {
    const provider1 = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
    });

    const provider2 = await givenConnectedProvider({
      signer: signer2,
      chain,
      owners,
      threshold,
    });

    const { aggregatedSignature, request, signatureObj } =
      await provider1.proposeUserOperation({
        uo: {
          target: provider1.getAddress(),
          data: "0x",
        },
        // Must specify realistic overrides when using a paymaster, because the flexible-gas feature for the last signer doesn't work with paymasters.
        overrides: {
          maxFeePerGas: { multiplier: 2 },
          maxPriorityFeePerGas: { multiplier: 3 },
          preVerificationGas: { multiplier: 1.5 },
        },
      });

    const result = await provider2.sendUserOperation({
      uo: request.callData,
      overrides: {
        callGasLimit: request.callGasLimit,
        verificationGasLimit: request.verificationGasLimit,
        preVerificationGas: request.preVerificationGas,
        maxFeePerGas: request.maxFeePerGas,
        maxPriorityFeePerGas: request.maxPriorityFeePerGas,
        nonceKey: fromHex(`0x${pad(request.nonce).slice(2, 26)}`, "bigint"), // Nonce key is the first 24 bytes of the nonce
        // @ts-ignore
        paymasterAndData: request.paymasterAndData,
      },
      context: {
        aggregatedSignature,
        signatures: [signatureObj],
        userOpSignatureType: "ACTUAL",
      },
    });
    const txnHash = provider2.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should successfully execute 3/3", async () => {
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
    expect(address).toBe("0xDAcFC8de3c63579BA8aF72a0b73262a85c176b3F");

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

    const result = await provider3.sendUserOperation({
      uo: request.callData,
      context: {
        aggregatedSignature,
        signatures: [signature1, signature2],
        userOpSignatureType: "ACTUAL",
      },
    });

    const txnHash = provider2.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should successfully execute 3/3 with alchemy paymaster info", async () => {
    const higherThreshold = 3n;

    const provider1 = await givenConnectedProvider({
      signer: signer1,
      chain,
      owners,
      threshold: higherThreshold,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
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
    expect(address).toBe("0xDAcFC8de3c63579BA8aF72a0b73262a85c176b3F");

    const { request, signatureObj: signature1 } =
      await provider1.proposeUserOperation({
        uo: {
          target: provider1.getAddress(),
          data: "0x",
        },
        // Must specify realistic overrides when using a paymaster, because the flexible-gas feature for the last signer doesn't work with paymasters.
        overrides: {
          maxFeePerGas: { multiplier: 2 },
          maxPriorityFeePerGas: { multiplier: 3 },
          preVerificationGas: { multiplier: 1.5 },
        },
      });

    const { aggregatedSignature, signatureObj: signature2 } =
      await provider2.signMultisigUserOperation({
        account: provider2.account,
        signatures: [signature1],
        userOperationRequest: request,
      });

    const result = await provider3.sendUserOperation({
      uo: request.callData,
      overrides: {
        callGasLimit: request.callGasLimit,
        verificationGasLimit: request.verificationGasLimit,
        preVerificationGas: request.preVerificationGas,
        maxFeePerGas: request.maxFeePerGas,
        maxPriorityFeePerGas: request.maxPriorityFeePerGas,
        nonceKey: fromHex(`0x${pad(request.nonce).slice(2, 26)}`, "bigint"), // Nonce key is the first 24 bytes of the nonce
        // @ts-ignore
        paymasterAndData: request.paymasterAndData,
      },
      context: {
        aggregatedSignature,
        signatures: [signature1, signature2],
        userOpSignatureType: "ACTUAL",
      },
    });

    const txnHash = provider2.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);
});

const givenConnectedProvider = async ({
  signer,
  chain,
  accountAddress,
  opts,
  gasManagerConfig,
  useSimulation = false,
  owners,
  threshold,
}: AlchemyMultisigAccountClientConfig) =>
  createMultisigAccountAlchemyClient({
    chain,
    signer,
    owners,
    threshold,
    accountAddress,
    apiKey: API_KEY!,
    gasManagerConfig,
    useSimulation,
    opts: {
      txMaxRetries: 10,
      ...opts,
      feeOptions: {
        maxFeePerGas: { multiplier: 1.5 },
        maxPriorityFeePerGas: { multiplier: 1.5 },
        ...opts?.feeOptions,
      },
    },
  });
