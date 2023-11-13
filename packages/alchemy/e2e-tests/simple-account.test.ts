import type {
  PublicErc4337Client,
  UserOperationOverrides,
} from "@alchemy/aa-core";
import {
  SimpleSmartContractAccount,
  getDefaultSimpleAccountFactoryAddress,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
} from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";
import {
  toHex,
  type Address,
  type Chain,
  type HDAccount,
  type Hash,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import type { SimulateUserOperationAssetChangesResponse } from "../src/middleware/types/index.js";
import { AlchemyProvider } from "../src/provider.js";
import { API_KEY, OWNER_MNEMONIC, PAYMASTER_POLICY_ID } from "./constants.js";

const chain = sepolia;
const network = Network.ETH_SEPOLIA;

describe("Simple Account Tests", () => {
  const ownerAccount = mnemonicToAccount(OWNER_MNEMONIC);
  const owner: SmartAccountSigner<HDAccount> = {
    signMessage: async (msg) =>
      ownerAccount.signMessage({
        message: { raw: toHex(msg) },
      }),
    signTypedData: async () => "0xHash",
    getAddress: async () => ownerAccount.address,
    signerType: "aa-sdk-tests",
    inner: ownerAccount,
  };

  it("should successfully get counterfactual address", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    expect(await provider.getAddress()).toMatchInlineSnapshot(
      `"0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4"`
    );
  });

  it("should execute successfully", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    const result = await provider.sendUserOperation({
      target: await provider.getAddress(),
      data: "0x",
    });
    const txnHash = provider.waitForUserOperationTransaction(
      result.hash as Hash
    );

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = givenConnectedProvider({ owner, chain, accountAddress });

    const result = provider.sendUserOperation({
      target: await provider.getAddress(),
      data: "0x",
    });

    await expect(result).rejects.toThrowError();
  });

  it("should successfully execute with alchemy paymaster info", async () => {
    const provider = givenConnectedProvider({
      owner,
      chain,
    }).withAlchemyGasManager({
      policyId: PAYMASTER_POLICY_ID,
    });

    const result = await provider.sendUserOperation({
      target: await provider.getAddress(),
      data: "0x",
    });
    const txnHash = provider.waitForUserOperationTransaction(
      result.hash as Hash
    );

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should successfully override fees in alchemy paymaster", async () => {
    const provider = givenConnectedProvider({
      owner,
      chain,
      feeOptions: { maxFeePerGas: undefined, maxPriorityFeePerGas: undefined },
    })
      .withAlchemyGasManager({
        policyId: PAYMASTER_POLICY_ID,
      })
      .withFeeDataGetter(async () => ({
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 1n,
      }));

    // this should fail since we set super low fees
    await expect(
      async () =>
        await provider.sendUserOperation({
          target: await provider.getAddress(),
          data: "0x",
        })
    ).rejects.toThrow();
  }, 100000);

  it("should support overrides for buildUserOperation", async () => {
    const signer = givenConnectedProvider({
      owner,
      chain,
    }).withAlchemyGasManager({
      policyId: PAYMASTER_POLICY_ID,
    });

    const overrides: UserOperationOverrides = {
      maxFeePerGas: 100000000n,
      maxPriorityFeePerGas: 100000000n,
      paymasterAndData: "0x",
    };

    const uoStruct = await signer.buildUserOperation(
      {
        target: await signer.getAddress(),
        data: "0x",
      },
      overrides
    );

    expect(uoStruct.maxFeePerGas).toEqual(overrides.maxFeePerGas);
    expect(uoStruct.maxPriorityFeePerGas).toEqual(
      overrides.maxPriorityFeePerGas
    );
    expect(uoStruct.paymasterAndData).toEqual(overrides.paymasterAndData);
  }, 100000);

  it("should successfully use paymaster with fee opts", async () => {
    const provider = givenConnectedProvider({
      owner,
      chain,
      feeOptions: {
        maxFeePerGas: { percentage: 50 },
        maxPriorityFeePerGas: { percentage: 50 },
        preVerificationGas: { percentage: 50 },
      },
    });

    const result = await provider.sendUserOperation({
      target: await provider.getAddress(),
      data: "0x",
    });
    const txnHash = provider.waitForUserOperationTransaction(
      result.hash as Hash
    );

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should execute successfully via drop and replace", async () => {
    const provider = givenConnectedProvider({
      owner,
      chain,
    });

    const result = await provider.sendUserOperation({
      target: await provider.getAddress(),
      data: "0x",
    });
    const replacedResult = await provider.dropAndReplaceUserOperation(
      result.request
    );

    const txnHash = provider.waitForUserOperationTransaction(
      replacedResult.hash
    );
    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should execute successfully via drop and replace when using paymaster", async () => {
    const provider = givenConnectedProvider({
      owner,
      chain,
    }).withAlchemyGasManager({
      policyId: PAYMASTER_POLICY_ID,
    });

    const result = await provider.sendUserOperation({
      target: await provider.getAddress(),
      data: "0x",
    });
    const replacedResult = await provider.dropAndReplaceUserOperation(
      result.request
    );

    const txnHash = provider.waitForUserOperationTransaction(
      replacedResult.hash
    );
    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should get token balances for the smart account", async () => {
    const alchemy = new Alchemy({
      apiKey: API_KEY!,
      network,
    });
    const provider = givenConnectedProvider({
      owner,
      chain,
    })
      .withAlchemyGasManager({
        policyId: PAYMASTER_POLICY_ID,
      })
      .withAlchemyEnhancedApis(alchemy);

    const address = await provider.getAddress();
    const balances = await provider.core.getTokenBalances(address);
    expect(balances.tokenBalances.length).toMatchInlineSnapshot(`4`);
  }, 100000);

  it("should get owned nfts for the smart account", async () => {
    const alchemy = new Alchemy({
      apiKey: API_KEY!,
      network,
    });
    const provider = givenConnectedProvider({
      owner,
      chain,
    })
      .withAlchemyGasManager({
        policyId: PAYMASTER_POLICY_ID,
      })
      .withAlchemyEnhancedApis(alchemy);

    const address = await provider.getAddress();
    const nfts = await provider.nft.getNftsForOwner(address);
    expect(nfts.ownedNfts).toMatchInlineSnapshot("[]");
  }, 100000);

  it("should correctly simulate asset changes for the user operation", async () => {
    const provider = givenConnectedProvider({
      owner,
      chain,
    });

    const simulatedAssetChanges: SimulateUserOperationAssetChangesResponse =
      await provider.simulateUserOperationAssetChanges({
        target: provider.getEntryPointAddress(),
        data: "0x",
        value: 1n,
      });

    expect(simulatedAssetChanges.changes.length).toEqual(2);
    expect(
      simulatedAssetChanges.changes.map((change) => ({
        assertType: change.assetType,
        changeType: change.changeType,
        from: change.from.toLowerCase(),
        to: change.to.toLowerCase(),
      }))
    ).toEqual([
      {
        assertType: "NATIVE",
        changeType: "TRANSFER",
        from: (await provider.getAddress()).toLowerCase(),
        to: provider.getEntryPointAddress().toLowerCase(),
      },
      {
        assertType: "NATIVE",
        changeType: "TRANSFER",
        from: (await provider.getAddress()).toLowerCase(),
        to: provider.getEntryPointAddress().toLowerCase(),
      },
    ]);
  }, 100000);

  it("should simulate as part of middleware stack when added to provider", async () => {
    const provider = givenConnectedProvider({
      owner,
      chain,
    }).withAlchemyUserOpSimulation();

    const spy = vi.spyOn(provider, "simulateUOMiddleware");

    await provider.buildUserOperation({
      target: provider.getEntryPointAddress(),
      data: "0x",
      value: 1n,
    });

    expect(spy).toHaveBeenCalledOnce();
  }, 100000);
});

const givenConnectedProvider = ({
  owner,
  chain,
  accountAddress,
  feeOptions,
}: {
  owner: SmartAccountSigner;
  chain: Chain;
  accountAddress?: Address;
  feeOptions?: UserOperationFeeOptions;
}) =>
  new AlchemyProvider({
    apiKey: API_KEY!,
    chain,
    opts: {
      txMaxRetries: 10,
      feeOptions: {
        ...feeOptions,
        maxFeePerGas: { percentage: 50 },
        maxPriorityFeePerGas: { percentage: 5 },
      },
    },
  }).connect(
    (provider: PublicErc4337Client) =>
      new SimpleSmartContractAccount({
        chain,
        owner,
        factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
        rpcClient: provider,
        accountAddress,
      })
  );
