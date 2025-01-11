import {
  createBundlerClient,
  createSmartAccountClientFromExisting,
  erc7677Middleware,
  LocalAccountSigner,
  type Address,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { custom, type Chain } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import { local070Instance } from "~test/instances.js";
import { multiOwnerPluginActions } from "../../msca/plugins/multi-owner/index.js";
import { getMSCAUpgradeToData } from "../../msca/utils.js";
import type { LightAccountVersion } from "../types";
import { createMultiOwnerLightAccountClient } from "./multiOwnerLightAccount.js";
import {
  alchemy,
  alchemyEnhancedApiActions,
  arbitrumSepolia,
} from "@account-kit/infra";
import { Alchemy, Network } from "alchemy-sdk";

describe("Types: MultiOwner Light Account Tests", () => {
  const instance = local070Instance;
  let client: ReturnType<typeof instance.getClient>;

  beforeAll(async () => {
    client = instance.getClient();
  });

  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

  it("should upgrade a deployed multi owner light account to msca successfully", async () => {
    // create a owner signer to create the account
    const throwawaySigner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const throwawayClient = await givenConnectedProvider({
      signer: throwawaySigner,
    });

    const accountAddress = throwawayClient.getAddress();
    const ownerAddress = await throwawaySigner.getAddress();

    // fund + deploy the throwaway address
    await setBalance(client, {
      address: accountAddress,
      value: 200000000000000000n,
    });

    const { createMAAccount, ...upgradeToData } = await getMSCAUpgradeToData(
      throwawayClient,
      {
        account: throwawayClient.account,
        multiOwnerPluginAddress: "0xcE0000007B008F50d762D155002600004cD6c647",
      }
    );

    await throwawayClient.upgradeAccount({
      upgradeTo: upgradeToData,
      waitForTx: true,
    });

    const upgradedClient = createSmartAccountClientFromExisting({
      client: createBundlerClient({
        chain: instance.chain,
        transport: custom(client),
      }),
      account: await createMAAccount(),
    }).extend(multiOwnerPluginActions);

    const upgradedAccountAddress = upgradedClient.getAddress();

    const owners = await upgradedClient.readOwners({
      account: upgradedClient.account,
      pluginAddress: "0xcE0000007B008F50d762D155002600004cD6c647",
    });

    expect(upgradedAccountAddress).toBe(accountAddress);
    expect(owners).toContain(ownerAddress);
  }, 200000);

  it("should have enhanced api properties on the provider", async () => {
    const chain = arbitrumSepolia;
    const alchemy = new Alchemy({
      network: Network.MATIC_MUMBAI,
      apiKey: "test",
    });

    const provider = (
      await givenAlchemyConnectedProvider({ signer, chain })
    ).extend(alchemyEnhancedApiActions(alchemy));

    expect(provider.account).toBeDefined();
    expect(provider.waitForUserOperationTransaction).toBeDefined();
    expect(provider.sendUserOperation).toBeDefined();
    expect(provider.core).toBeDefined();
  });
  const givenAlchemyConnectedProvider = async ({
    signer,
    chain,
  }: {
    signer: SmartAccountSigner;
    chain: Chain;
  }) =>
    createMultiOwnerLightAccountClient({
      transport: alchemy({
        jwt: "test",
      }),
      chain,
      signer,
      accountAddress: "0x86f3B0211764971Ad0Fc8C8898d31f5d792faD84",
    });

  const givenConnectedProvider = ({
    signer,
    version = "v2.0.0",
    accountAddress,
    usePaymaster = false,
    accountIndex,
  }: {
    signer: SmartAccountSigner;
    version?: LightAccountVersion<"MultiOwnerLightAccount">;
    usePaymaster?: boolean;
    accountAddress?: Address;
    accountIndex?: bigint;
  }) =>
    createMultiOwnerLightAccountClient({
      signer,
      accountAddress,
      version,
      transport: custom(client),
      chain: instance.chain,
      salt: accountIndex,
      ...(usePaymaster ? erc7677Middleware() : {}),
    });
});
