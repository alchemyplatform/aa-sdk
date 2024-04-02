import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";
import * as simulateUoActions from "../src/actions/simulateUserOperationChanges.js";
import { alchemyEnhancedApiActions } from "../src/client/decorators/alchemyEnhancedApis.js";
import {
  createMultisigAccountAlchemyClient,
  type AlchemyMultisigAccountClientConfig,
} from "../src/index.js";
import {
  API_KEY,
  MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
  PAYMASTER_POLICY_ID,
} from "./constants.js";
import { fromHex, pad } from "viem";

const simulateUoChangesSpy = vi.spyOn(
  simulateUoActions,
  "simulateUserOperationChanges"
);

const chain = sepolia;
const network = Network.ETH_SEPOLIA;

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

    const { aggregatedSignature, request } =
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

    console.log("aggregated signature", aggregatedSignature);

    const result = await provider2.sendUserOperation({
      uo: request.callData,
      overrides: {
        callGasLimit: request.callGasLimit,
        verificationGasLimit: request.verificationGasLimit,
        preVerificationGas: request.preVerificationGas,
        maxFeePerGas: request.maxFeePerGas,
        maxPriorityFeePerGas: request.maxPriorityFeePerGas,
        nonceKey: fromHex(`0x${pad(request.nonce).slice(2, 26)}`, "bigint"), // Nonce key is the first 24 bytes of the nonce
        paymasterAndData: request.paymasterAndData,
      },
      context: {
        signature: aggregatedSignature,
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
