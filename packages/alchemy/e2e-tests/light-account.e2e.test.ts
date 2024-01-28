import type { UserOperationOverrides } from "@alchemy/aa-core";
import { LocalAccountSigner } from "@alchemy/aa-core";
import { sepolia } from "viem/chains";
import {
  createLightAccountAlchemyClient,
  type AlchemyLightAccountClientConfig,
} from "../src/index.js";
import {
  API_KEY,
  LIGHT_ACCOUNT_OWNER_MNEMONIC,
  PAYMASTER_POLICY_ID,
} from "./constants.js";

const chain = sepolia;

describe("Light Account Tests", () => {
  const owner = LocalAccountSigner.mnemonicToAccountSigner(
    LIGHT_ACCOUNT_OWNER_MNEMONIC
  );

  it("should successfully get counterfactual address", async () => {
    const provider = await givenConnectedProvider({ owner, chain });
    expect(provider.account.address).toMatchInlineSnapshot(
      '"0x86f3B0211764971Ad0Fc8C8898d31f5d792faD84"'
    );
  });

  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({ owner, chain });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.account.address,
        data: "0x",
      },
    });

    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = await givenConnectedProvider({
      owner,
      chain,
      accountAddress,
    });

    const result = provider.sendUserOperation({
      uo: {
        target: provider.account.address,
        data: "0x",
      },
    });

    await expect(result).rejects.toThrowError();
  });

  it("should successfully execute with alchemy paymaster info", async () => {
    const provider = await givenConnectedProvider({
      owner,
      chain,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.account.address,
        data: "0x",
      },
    });
    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should successfully override fees in alchemy paymaster", async () => {
    const provider = await givenConnectedProvider({
      owner,
      chain,
      opts: {
        feeOptions: {
          maxFeePerGas: undefined,
          maxPriorityFeePerGas: undefined,
        },
      },
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
      feeEstimator: async (struct) => ({
        ...struct,
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 1n,
      }),
    });

    // this should fail since we set super low fees
    await expect(
      provider.sendUserOperation({
        uo: {
          target: provider.account.address,
          data: "0x",
        },
      })
    ).rejects.toThrow();
  }, 100000);

  it("should support overrides for buildUserOperation", async () => {
    const signer = await givenConnectedProvider({
      owner,
      chain,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
    });

    const overrides: UserOperationOverrides = {
      maxFeePerGas: 100000000n,
      maxPriorityFeePerGas: 100000000n,
      paymasterAndData: "0x",
    };

    const uoStruct = await signer.buildUserOperation({
      uo: {
        target: signer.account.address,
        data: "0x",
      },
      overrides,
    });

    expect(uoStruct.maxFeePerGas).toEqual(overrides.maxFeePerGas);
    expect(uoStruct.maxPriorityFeePerGas).toEqual(
      overrides.maxPriorityFeePerGas
    );
    expect(uoStruct.paymasterAndData).toEqual(overrides.paymasterAndData);
  }, 100000);

  it("should successfully use paymaster with fee opts", async () => {
    const provider = await givenConnectedProvider({
      owner,
      chain,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
      opts: {
        feeOptions: {
          maxFeePerGas: { percentage: 50 },
          maxPriorityFeePerGas: { percentage: 50 },
          preVerificationGas: { percentage: 50 },
        },
      },
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.account.address,
        data: "0x",
      },
    });
    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should execute successfully via drop and replace", async () => {
    const provider = await givenConnectedProvider({
      owner,
      chain,
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.account.address,
        data: "0x",
      },
    });
    const replacedResult = await provider.dropAndReplaceUserOperation({
      uoToDrop: result.request,
    });

    const txnHash = provider.waitForUserOperationTransaction(replacedResult);
    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should execute successfully via drop and replace when using paymaster", async () => {
    const provider = await givenConnectedProvider({
      owner,
      chain,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.account.address,
        data: "0x",
      },
    });
    const replacedResult = await provider.dropAndReplaceUserOperation({
      uoToDrop: result.request,
    });

    const txnHash = provider.waitForUserOperationTransaction(replacedResult);
    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  // TODO: come back to this!!!
  // it("should get token balances for the smart account", async () => {
  //   const alchemy = new Alchemy({
  //     apiKey: API_KEY!,
  //     network,
  //   });

  //   const provider = await givenConnectedProvider({
  //     owner,
  //     chain,
  //     gasManagerConfig: {
  //       policyId: PAYMASTER_POLICY_ID,
  //     },
  //   }).withAlchemyEnhancedApis(alchemy);

  //   const address = provider.account.address;
  //   const balances = await provider.core.getTokenBalances(address);
  //   expect(balances.tokenBalances.length).toMatchInlineSnapshot("1");
  // }, 50000);

  // TODO: come back to this!!!
  // it("should get owned nfts for the smart account", async () => {
  //   const alchemy = new Alchemy({
  //     apiKey: API_KEY!,
  //     network,
  //   });
  //   const provider = await givenConnectedProvider({
  //     owner,
  //     chain,
  //     gasManagerConfig: {
  //       policyId: PAYMASTER_POLICY_ID,
  //     },
  //   }).withAlchemyEnhancedApis(alchemy);

  //   const address = provider.account.address;
  //   const nfts = await provider.nft.getNftsForOwner(address);
  //   expect(nfts.ownedNfts).toMatchInlineSnapshot("[]");
  // }, 100000);

  it("should correctly simulate asset changes for the user operation", async () => {
    const provider = await givenConnectedProvider({
      owner,
      chain,
    });

    const simulatedAssetChanges = await provider.simulateUserOperation({
      uo: {
        target: provider.account.getEntrypoint(),
        data: "0x",
        value: 1n,
      },
    });

    expect(simulatedAssetChanges.changes.length).toMatchInlineSnapshot("2");
  }, 50000);

  it("should simulate as part of middleware stack when added to provider", async () => {
    const provider = await givenConnectedProvider({
      owner,
      chain,
      useSimulation: true,
    });

    const spy = vi.spyOn(provider, "simulateUserOperation");

    await provider.buildUserOperation({
      uo: {
        target: provider.account.getEntrypoint(),
        data: "0x",
        value: 1n,
      },
    });

    expect(spy).toHaveBeenCalledOnce();
  }, 100000);
});

const givenConnectedProvider = async ({
  owner,
  chain,
  accountAddress,
  opts,
  gasManagerConfig,
  useSimulation = false,
}: AlchemyLightAccountClientConfig) =>
  createLightAccountAlchemyClient({
    chain,
    owner,
    accountAddress,
    apiKey: API_KEY!,
    gasManagerConfig,
    useSimulation,
    opts: {
      ...opts,
      txMaxRetries: 10,
      feeOptions: {
        ...opts?.feeOptions,
        maxFeePerGas: { percentage: 50 },
        maxPriorityFeePerGas: { percentage: 50 },
      },
    },
  });
