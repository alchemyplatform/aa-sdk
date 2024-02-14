import {
  LocalAccountSigner,
  LogLevel,
  Logger,
  applyUserOpOverrideOrFeeOption,
  arbitrumSepolia,
  createBundlerClient,
  createSmartAccountClientFromExisting,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
} from "@alchemy/aa-core";
import {
  http,
  isAddress,
  type Address,
  type Chain,
  type HDAccount,
} from "viem";
import { generatePrivateKey } from "viem/accounts";
import {
  multiOwnerPluginActions,
  type LightAccountVersion,
} from "../../index.js";
import { getMSCAUpgradeToData } from "../../msca/utils.js";
import { createLightAccountClient } from "../client.js";
import {
  API_KEY,
  LIGHT_ACCOUNT_OWNER_MNEMONIC,
  UNDEPLOYED_OWNER_MNEMONIC,
} from "./constants.js";

const chain = arbitrumSepolia;

Logger.setLogLevel(LogLevel.DEBUG);

describe("Light Account Tests", () => {
  const owner: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(LIGHT_ACCOUNT_OWNER_MNEMONIC);
  const undeployedOwner = LocalAccountSigner.mnemonicToAccountSigner(
    UNDEPLOYED_OWNER_MNEMONIC
  );

  it.each([
    { version: "v1.0.1" as const, expected: true },
    { version: "v1.0.2" as const, throws: true },
    { version: "v1.1.0" as const, expected: true },
  ])(
    "LA version $version should correctly verify 1271 signatures",
    async ({ version, expected, throws }) => {
      const provider = await givenConnectedProvider({ owner, chain, version });
      const message = "test";

      if (!throws) {
        const signature = await provider.account.signMessage({ message });
        expect(
          await provider.verifyMessage({
            address: provider.getAddress(),
            message,
            signature,
          })
        ).toBe(expected);
      } else {
        await expect(
          provider.account.signMessage({ message })
        ).rejects.toThrowError();
      }
    }
  );

  it("should successfully get counterfactual address", async () => {
    const {
      account: { address },
    } = await givenConnectedProvider({ owner, chain });
    expect(address).toMatchInlineSnapshot(
      '"0x86f3B0211764971Ad0Fc8C8898d31f5d792faD84"'
    );
  });

  it("should sign typed data with 6492 successfully for undeployed account", async () => {
    const { account } = await givenConnectedProvider({
      owner: undeployedOwner,
      chain,
    });

    expect(
      await account.signTypedDataWith6492({
        types: {
          Request: [{ name: "hello", type: "string" }],
        },
        primaryType: "Request",
        message: {
          hello: "world",
        },
      })
    ).toMatchInlineSnapshot(
      '"0x00000000000000000000000000004ec70002a32400f8ae005a26081065620d20000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000445fbfb9cf000000000000000000000000ef9d7530d16df66481adf291dc9a12b44c7f7df00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041fed7fa410f969b34bba170241032b72ae4d6abccd4fa0b3bacec3b33f07af69e39c6f8fde4b08c1047b7665ea34a46a754d625270f135becb3ca918b53c6afbb1b000000000000000000000000000000000000000000000000000000000000006492649264926492649264926492649264926492649264926492649264926492"'
    );
  });

  it("should sign message with 6492 successfully for undeployed account", async () => {
    const { account } = await givenConnectedProvider({
      owner: undeployedOwner,
      chain,
    });
    expect(
      await account.signMessageWith6492({ message: "test" })
    ).toMatchInlineSnapshot(
      '"0x00000000000000000000000000004ec70002a32400f8ae005a26081065620d20000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000445fbfb9cf000000000000000000000000ef9d7530d16df66481adf291dc9a12b44c7f7df00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041e339ebe75e54edaeec03228d497459d0165cda4d8d0ac66896ec203c1ee2c6a11e65a47c603764b4ec7a4f7bb00f073f4e4becb8dedfbba9bfa71a93b261a05b1c000000000000000000000000000000000000000000000000000000000000006492649264926492649264926492649264926492649264926492649264926492"'
    );
  });

  /**
   * Need to add test eth to the counterfactual address for this test to pass.
   * For current balance, @see: https://sepolia.etherscan.io/address/0x7eDdc16B15259E5541aCfdebC46929873839B872
   */
  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({ owner, chain });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });
    const txnHash = provider.waitForUserOperationTransaction({
      hash: result.hash,
    });

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const newProvider = await givenConnectedProvider({
      owner,
      chain,
      accountAddress,
    });

    const result = newProvider.sendUserOperation({
      uo: {
        target: newProvider.getAddress(),
        data: "0x",
      },
    });

    await expect(result).rejects.toThrowError();
  });

  it("should get counterfactual for undeployed account", async () => {
    const owner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const {
      account: { address },
    } = await givenConnectedProvider({ owner, chain });

    expect(isAddress(address)).toBe(true);
  });

  it("should get owner successfully", async () => {
    const provider = await givenConnectedProvider({ owner, chain });
    expect(await provider.account.getOwnerAddress()).toMatchInlineSnapshot(
      '"0x65eaA2AfDF6c97295bA44C458abb00FebFB3a5FA"'
    );
    expect(await provider.account.getOwnerAddress()).toBe(
      await owner.getAddress()
    );
  });

  it("should transfer ownership successfully", async () => {
    const provider = await givenConnectedProvider({
      owner,
      chain,
    });

    // create a throwaway address
    const throwawayOwner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const throwawayProvider = await givenConnectedProvider({
      owner: throwawayOwner,
      chain,
    });

    const oldOwner = await throwawayOwner.getAddress();

    // fund the throwaway address
    await provider.sendTransaction({
      to: throwawayProvider.getAddress(),
      data: "0x",
      value: 200000000000000000n,
    });

    // create new owner and transfer ownership
    const newThrowawayOwner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );

    await throwawayProvider.transferOwnership({
      newOwner: newThrowawayOwner,
      waitForTxn: true,
    });

    const newOwnerViaProvider =
      await throwawayProvider.account.getOwnerAddress();
    const newOwner = await newThrowawayOwner.getAddress();

    expect(newOwnerViaProvider).not.toBe(oldOwner);
    expect(newOwnerViaProvider).toBe(newOwner);
  }, 100000);

  it("should upgrade a deployed light account to msca successfully", async () => {
    const provider = await givenConnectedProvider({
      owner,
      chain,
    });

    // create a throwaway address
    const throwawayOwner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const throwawayProvider = await givenConnectedProvider({
      owner: throwawayOwner,
      chain,
    });

    const accountAddress = throwawayProvider.getAddress();
    const ownerAddress = await throwawayOwner.getAddress();

    // fund + deploy the throwaway address
    await provider.sendTransaction({
      to: accountAddress,
      data: "0x",
      value: 200000000000000000n,
    });

    const { createMAAccount, ...upgradeToData } = await getMSCAUpgradeToData(
      throwawayProvider,
      { account: throwawayProvider.account }
    );

    await throwawayProvider.upgradeAccount({
      upgradeTo: upgradeToData,
      waitForTx: true,
    });

    const upgradedProvider = createSmartAccountClientFromExisting({
      client: createBundlerClient({
        chain,
        transport: http(`${chain.rpcUrls.alchemy.http[0]}/${API_KEY!}`),
      }),
      account: await createMAAccount(),
    }).extend(multiOwnerPluginActions);

    const upgradedAccountAddress = upgradedProvider.getAddress();

    const owners = await upgradedProvider.readOwners({
      account: upgradedProvider.account,
    });

    expect(upgradedAccountAddress).toBe(accountAddress);
    expect(owners).toContain(ownerAddress);
  }, 200000);
});

const givenConnectedProvider = async ({
  owner,
  chain,
  accountAddress,
  feeOptions,
  version = "v1.1.0",
}: {
  owner: SmartAccountSigner;
  chain: Chain;
  accountAddress?: Address;
  feeOptions?: UserOperationFeeOptions;
  version?: LightAccountVersion;
}) => {
  const client = await createLightAccountClient({
    transport: http(`${chain.rpcUrls.alchemy.http[0]}/${API_KEY!}`),
    chain: chain,
    account: {
      owner,
      accountAddress,
      version,
    },
    feeEstimator: async (struct, { overrides, feeOptions }) => {
      let [block, maxPriorityFeePerGasEstimate] = await Promise.all([
        client.getBlock({ blockTag: "latest" }),
        // it's a fair assumption that if someone is using this Alchemy Middleware, then they are using Alchemy RPC
        client.request({
          // @ts-ignore
          method: "rundler_maxPriorityFeePerGas",
          params: [],
        }),
      ]);

      const baseFeePerGas = block.baseFeePerGas;
      if (baseFeePerGas == null) {
        throw new Error("baseFeePerGas is null");
      }

      const maxPriorityFeePerGas = applyUserOpOverrideOrFeeOption(
        maxPriorityFeePerGasEstimate as unknown as bigint,
        overrides?.maxPriorityFeePerGas,
        feeOptions?.maxPriorityFeePerGas
      );
      const maxFeePerGas = applyUserOpOverrideOrFeeOption(
        baseFeePerGas + BigInt(maxPriorityFeePerGas),
        overrides?.maxFeePerGas,
        feeOptions?.maxFeePerGas
      );

      return {
        ...struct,
        maxPriorityFeePerGas,
        maxFeePerGas,
      };
    },
    opts: {
      feeOptions: {
        ...feeOptions,
        maxFeePerGas: { percentage: 50 },
        maxPriorityFeePerGas: { percentage: 50 },
      },
      txMaxRetries: 100,
    },
  });

  return client;
};
