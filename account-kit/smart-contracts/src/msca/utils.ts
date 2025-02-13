import {
  AccountNotFoundError,
  ChainNotFoundError,
  type GetAccountParameter,
  type SmartAccountClient,
  type SmartAccountSigner,
  type SmartContractAccount,
  type SmartContractAccountWithSigner,
  type UpgradeToData,
} from "@aa-sdk/core";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
} from "@account-kit/infra";
import type { Address, Chain, Transport } from "viem";
import {
  custom,
  encodeAbiParameters,
  encodeFunctionData,
  encodeFunctionResult,
  keccak256,
  parseAbiParameters,
} from "viem";
import { IPluginAbi } from "./abis/IPlugin.js";
import { MultiOwnerModularAccountFactoryAbi } from "./abis/MultiOwnerModularAccountFactory.js";
import { UpgradeableModularAccountAbi } from "./abis/UpgradeableModularAccount.js";
import {
  createMultiOwnerModularAccount,
  type MultiOwnerModularAccount,
} from "./account/multiOwnerAccount.js";
import { MultiOwnerPlugin } from "./plugins/multi-owner/plugin.js";

/**
 * Utility method returning the default multi sig msca factory address given a chain
 *
 * @param {Chain} chain the chain object for which to get the address
 * @returns {Address} the address for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultMultisigModularAccountFactoryAddress = (
  chain: Chain
): Address => {
  switch (chain.id) {
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x000000000000204327E6669f00901a57CE15aE15";
  }
};

/**
 * Utility method returning the default multi owner msca factory address given a chain
 *
 * @param {Chain} chain the chain object for which to get the address
 * @returns {Address} the address for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultMultiOwnerModularAccountFactoryAddress = (
  chain: Chain
): Address => {
  switch (chain.id) {
    default:
      return "0x000000e92D78D90000007F0082006FDA09BD5f11";
  }
};

export type GetMSCAUpgradeToData<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends
    | SmartContractAccountWithSigner<string, TSigner>
    | undefined = SmartContractAccountWithSigner<string, TSigner> | undefined
> = {
  multiOwnerPluginAddress?: Address;
} & GetAccountParameter<TAccount>;

/**
 * Retrieves the data necessary to upgrade to a Multi-Signature Contract Account (MSCA) and provides a method to create a Multi-Owner Modular Account.
 *
 * @example
 * ```ts
 * import { createLightAccountClient, getMSCAUpgradeToData } from "@account-kit/smart-contracts";
 *
 * const client = createLightAccountClient(...);
 * const upgradeData = await getMSCAUpgradeToData(client, {});
 * ```
 *
 * @param {SmartAccountClient<TTransport, TChain, TAccount>} client The smart account client
 * @param {GetMSCAUpgradeToData<TSigner, TAccount>} args The arguments required for the upgrade
 * @returns {Promise<UpgradeToData & { createMAAccount: () => Promise<MultiOwnerModularAccount<TSigner>>}>} A promise that resolves to upgrade data augmented with a function to create a Multi-Owner Modular Account
 */
export async function getMSCAUpgradeToData<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends
    | SmartContractAccountWithSigner<string, TSigner>
    | undefined = SmartContractAccountWithSigner<string, TSigner> | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>,
  args: GetMSCAUpgradeToData<TSigner, TAccount>
): Promise<
  UpgradeToData & {
    createMAAccount: () => Promise<MultiOwnerModularAccount<TSigner>>;
  }
> {
  const { account: account_ = client.account, multiOwnerPluginAddress } = args;

  if (!account_) {
    throw new AccountNotFoundError();
  }
  const account = account_ as SmartContractAccountWithSigner<string, TSigner>;

  const chain = client.chain;
  if (!chain) {
    throw new ChainNotFoundError();
  }

  const initData = await getMAInitializationData({
    client,
    multiOwnerPluginAddress,
    signerAddress: await account.getSigner().getAddress(),
  });

  return {
    ...initData,
    createMAAccount: async () =>
      createMultiOwnerModularAccount({
        transport: custom(client.transport),
        chain: chain as Chain,
        signer: account.getSigner(),
        accountAddress: account.address,
      }),
  };
}

export type GetMAInitializationDataParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  multiOwnerPluginAddress?: Address;
  client: SmartAccountClient<TTransport, TChain, TAccount>;
  signerAddress: Address | Address[];
};

/**
 * Retrieves the initialization data for a multi-owner modular account. Throws an error if the client's chain is not found or if the multi-owner plugin address is not retrievable.
 *
 * @example
 * ```ts
 * import { getMAInitializationData } from "@account-kit/smart-contracts";
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * const client = createSmartAccountClient(...);
 * const initializationData = await getMAInitializationData({
 *  client,
 *  signerAddress: "0x...", // or array of signers
 * });
 * ```
 *
 * @param {GetMAInitializationDataParams<TTransport, TChain, TAccount>} params the parameters for getting initialization data
 * @param {SmartAccountClient<TTransport, TChain, TAccount>} params.client the smart account client
 * @param {Address | Address[]} params.signerAddress the address of the signer or an array of signer addresses
 * @param {Address} [params.multiOwnerPluginAddress] optional address of the multi-owner plugin
 * @returns {Promise<UpgradeToData>} a promise that resolves to the initialization data required for upgrading to a multi-owner modular account
 */
export async function getMAInitializationData<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>({
  client,
  multiOwnerPluginAddress,
  signerAddress,
}: GetMAInitializationDataParams<
  TTransport,
  TChain,
  TAccount
>): Promise<UpgradeToData> {
  if (!client.chain) {
    throw new ChainNotFoundError();
  }

  const factoryAddress = getDefaultMultiOwnerModularAccountFactoryAddress(
    client.chain
  );

  const implAddress = await client.readContract({
    abi: MultiOwnerModularAccountFactoryAbi,
    address: factoryAddress,
    functionName: "IMPL",
  });

  const multiOwnerAddress =
    multiOwnerPluginAddress ?? MultiOwnerPlugin.meta.addresses[client.chain.id];

  if (!multiOwnerAddress) {
    throw new Error("could not get multi owner plugin address");
  }

  const moPluginManifest = await client.readContract({
    abi: IPluginAbi,
    address: multiOwnerAddress,
    functionName: "pluginManifest",
  });

  const hashedMultiOwnerPluginManifest = keccak256(
    encodeFunctionResult({
      abi: IPluginAbi,
      functionName: "pluginManifest",
      result: moPluginManifest,
    })
  );

  const encodedOwner = encodeAbiParameters(
    parseAbiParameters("address[]"),
    Array.isArray(signerAddress) ? [signerAddress] : [[signerAddress]]
  );

  const encodedPluginInitData = encodeAbiParameters(
    parseAbiParameters("bytes32[], bytes[]"),
    [[hashedMultiOwnerPluginManifest], [encodedOwner]]
  );

  const encodedMSCAInitializeData = encodeFunctionData({
    abi: UpgradeableModularAccountAbi,
    functionName: "initialize",
    args: [[multiOwnerAddress], encodedPluginInitData],
  });

  return {
    implAddress,
    initializationData: encodedMSCAInitializeData,
  };
}
