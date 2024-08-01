import {
  LocalAccountSigner,
  LogLevel,
  Logger,
  createBundlerClient,
  createSmartAccountClientFromExisting,
  getEntryPoint,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
} from "@aa-sdk/core";
import { arbitrumSepolia } from "@account-kit/infra";
import {
  custom,
  http,
  isAddress,
  type Address,
  type Chain,
  type HDAccount,
  type Hex,
} from "viem";
import { generatePrivateKey } from "viem/accounts";
import {
  createLightAccount,
  lightAccountClientActions,
  multiOwnerPluginActions,
  type GetLightAccountVersion,
  type LightAccountVersion,
} from "../../index.js";
import { getMSCAUpgradeToData } from "../../msca/utils.js";
import {
  API_KEY,
  API_KEY_STAGING,
  LIGHT_ACCOUNT_OWNER_MNEMONIC,
  UNDEPLOYED_OWNER_MNEMONIC,
} from "./constants.js";

Logger.setLogLevel(LogLevel.VERBOSE);

const rpcUrl = "https://arb-sepolia.g.alchemypreview.com/v2";
const chain = arbitrumSepolia;

describe("Light Account v2 Tests", () => {
  const signer: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(LIGHT_ACCOUNT_OWNER_MNEMONIC);
  const undeployedAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
    UNDEPLOYED_OWNER_MNEMONIC
  );

  it.each([{ version: "v2.0.0" as const, expected: true }])(
    "LA version $version 1271 signing support",
    async ({
      version,
      expected,
      throws,
    }: {
      version: LightAccountVersion;
      expected?: boolean;
      throws?: boolean;
    }) => {
      const client = await givenConnectedClient({ signer, chain, version });
      const message = "test";

      if (!throws) {
        const signature = await client.account.signMessage({ message });
        expect(
          await client.verifyMessage({
            address: client.getAddress(),
            message,
            signature,
          })
        ).toBe(expected);
      } else {
        await expect(
          client.account.signMessage({ message })
        ).rejects.toThrowError();
      }
    }
  );

  it("should successfully get counterfactual address", async () => {
    const {
      account: { address },
    } = await givenConnectedClient({ signer, chain });
    expect(address).toMatchInlineSnapshot(
      '"0x86f3B0211764971Ad0Fc8C8898d31f5d792faD84"'
    );
  });

  it("should sign typed data with 6492 successfully for undeployed account", async () => {
    const { account } = await givenConnectedClient({
      signer: undeployedAccountSigner,
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
      '"0x00000000000000000000000000004ec70002a32400f8ae005a26081065620d20000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000445fbfb9cf000000000000000000000000ef9d7530d16df66481adf291dc9a12b44c7f7df00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041ac03c38ea7f6308cf37067659115b9c982cd29354db4e90044cce8a113fd66890588245cf7076f5364de6010e5e5aff42efec5c719b5de3f555d389766518a2b1b000000000000000000000000000000000000000000000000000000000000006492649264926492649264926492649264926492649264926492649264926492"'
    );
  });

  it("should sign message with 6492 successfully for undeployed account", async () => {
    const { account } = await givenConnectedClient({
      signer: undeployedAccountSigner,
      chain,
    });
    expect(
      await account.signMessageWith6492({ message: "test" })
    ).toMatchInlineSnapshot(
      '"0x00000000000000000000000000004ec70002a32400f8ae005a26081065620d20000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000445fbfb9cf000000000000000000000000ef9d7530d16df66481adf291dc9a12b44c7f7df0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004181c6c4855d1cb16616c78e4b99bdde42eeda6bc8fbec920434e196445b64dede539eb9d934092f8e472766ded3f06d1a5f8ed2c209a5aaac7b13f9a8795757381b000000000000000000000000000000000000000000000000000000000000006492649264926492649264926492649264926492649264926492649264926492"'
    );
  });

  /**
   * Need to add test eth to the counterfactual address for this test to pass.
   * For current balance, @see: https://sepolia.etherscan.io/address/0x7eDdc16B15259E5541aCfdebC46929873839B872
   */
  it("should execute successfully", async () => {
    const client = await givenConnectedClient({ signer, chain });

    const result = await client.sendUserOperation({
      uo: {
        target: client.getAddress(),
        data: "0x",
      },
    });
    const txnHash = client.waitForUserOperationTransaction({
      hash: result.hash,
    });

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const newClient = await givenConnectedClient({
      signer,
      chain,
      accountAddress,
    });

    const result = newClient.sendUserOperation({
      uo: {
        target: newClient.getAddress(),
        data: "0x",
      },
    });

    await expect(result).rejects.toThrowError();
  });

  it("should get counterfactual for undeployed account", async () => {
    const newSigner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const {
      account: { address },
    } = await givenConnectedClient({ signer: newSigner, chain });

    expect(isAddress(address)).toBe(true);
  });

  it("should get on-chain owner address successfully", async () => {
    const client = await givenConnectedClient({ signer, chain });
    expect(await client.account.getOwnerAddress()).toMatchInlineSnapshot(
      '"0x65eaA2AfDF6c97295bA44C458abb00FebFB3a5FA"'
    );
    // match with current signer
    expect(await client.account.getOwnerAddress()).toBe(
      await signer.getAddress()
    );
  });

  it("should transfer ownership successfully", async () => {
    const client = await givenConnectedClient({
      signer,
      chain,
    });

    // create a throwaway address
    const throwawaySigner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const throwawayClient = await givenConnectedClient({
      signer: throwawaySigner,
      chain,
    });

    // fund the throwaway address
    await client.sendTransaction({
      chain: client.chain,
      to: throwawayClient.getAddress(),
      data: "0x",
      value: 200000000000000000n,
      maxFeePerBlobGas: 1000000000n,
      blobs: [] as Hex[],
    });

    // create new signer and transfer ownership
    const newOwner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );

    await throwawayClient.transferOwnership({
      newOwner,
      waitForTxn: true,
    });

    const newOwnerClient = await givenConnectedClient({
      signer: newOwner,
      chain,
      accountAddress: throwawayClient.getAddress(),
    });

    const newOwnerAddress = await newOwnerClient.account.getOwnerAddress();

    expect(newOwnerAddress).not.toBe(await throwawaySigner.getAddress());
    expect(newOwnerAddress).toBe(await newOwner.getAddress());
  }, 100000);

  it("should upgrade a deployed light account to msca successfully", async () => {
    const client = await givenConnectedClient({
      signer,
      chain,
    });

    // create a owner signer to create the account
    const throwawaySigner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const throwawayClient = await givenConnectedClient({
      signer: throwawaySigner,
      chain,
    });

    const accountAddress = throwawayClient.getAddress();
    const ownerAddress = await throwawaySigner.getAddress();

    // fund + deploy the throwaway address
    await client.sendTransaction({
      chain: client.chain,
      to: throwawayClient.getAddress(),
      data: "0x",
      value: 200000000000000000n,
      maxFeePerBlobGas: 1000000000n,
      blobs: [] as Hex[],
    });

    const { createMAAccount, ...upgradeToData } = await getMSCAUpgradeToData(
      throwawayClient,
      { account: throwawayClient.account }
    );

    await throwawayClient.upgradeAccount({
      upgradeTo: upgradeToData,
      waitForTx: true,
    });

    const upgradedClient = createSmartAccountClientFromExisting({
      client: createBundlerClient({
        chain,
        transport: http(`${chain.rpcUrls.alchemy.http[0]}/${API_KEY!}`),
      }),
      account: await createMAAccount(),
    }).extend(multiOwnerPluginActions);

    const upgradedAccountAddress = upgradedClient.getAddress();

    const owners = await upgradedClient.readOwners({
      account: upgradedClient.account,
    });

    expect(upgradedAccountAddress).toBe(accountAddress);
    expect(owners).toContain(ownerAddress);
  }, 200000);
});

const givenConnectedClient = async ({
  signer,
  chain,
  accountAddress,
  feeOptions,
  version = "v2.0.0",
}: {
  signer: SmartAccountSigner;
  chain: Chain;
  accountAddress?: Address;
  feeOptions?: UserOperationFeeOptions;
  version?: GetLightAccountVersion<"LightAccount">;
}) => {
  const client = createBundlerClient({
    chain,
    transport: (opts) => {
      const bundlerRpc = http(`${rpcUrl}/${API_KEY_STAGING}`)(opts);
      const publicRpc = http(`${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`)(
        opts
      );

      return custom({
        request: async (args) => {
          const bundlerMethods = new Set([
            "eth_sendUserOperation",
            "eth_estimateUserOperationGas",
            "eth_getUserOperationReceipt",
            "eth_getUserOperationByHash",
            "eth_supportedEntryPoints",
          ]);

          if (bundlerMethods.has(args.method)) {
            return bundlerRpc.request(args);
          } else {
            return publicRpc.request(args);
          }
        },
      })(opts);
    },
  });
  return createSmartAccountClientFromExisting({
    client,
    account: await createLightAccount({
      chain,
      signer,
      entryPoint: getEntryPoint(chain, { version: "0.7.0" }),
      transport: custom(client),
      accountAddress,
      version,
    }),
    opts: {
      feeOptions: {
        ...feeOptions,
        maxFeePerGas: { multiplier: 1.5 },
        maxPriorityFeePerGas: { multiplier: 1.5 },
      },
      txMaxRetries: 100,
    },
  }).extend(lightAccountClientActions);
};
