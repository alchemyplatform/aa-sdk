import {
  AccountNotFoundError,
  ChainNotFoundError,
  DefaultFactoryNotDefinedError,
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
  type GetAccountParameter,
  type SmartAccountClient,
  type SmartAccountSigner,
  type SmartContractAccountWithSigner,
  type UpgradeToData,
} from "@alchemy/aa-core";
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
 * Utility method returning the default multi owner msca factory address given a {@link Chain} object
 *
 * @param chain - a {@link Chain} object
 * @returns a {@link Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultMultiOwnerModularAccountFactoryAddress = (
  chain: Chain
): Address => {
  switch (chain.id) {
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case goerli.id:
    case polygonAmoy.id:
    case polygonMumbai.id:
    case optimism.id:
    case optimismGoerli.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumGoerli.id:
    case arbitrumSepolia.id:
    case base.id:
    case baseGoerli.id:
      return "0x000000e92D78D90000007F0082006FDA09BD5f11";
  }
  throw new DefaultFactoryNotDefinedError("MultiOwnerModularAccount", chain);
};

export async function getMSCAUpgradeToData<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends
    | SmartContractAccountWithSigner<string, TSigner>
    | undefined = SmartContractAccountWithSigner<string, TSigner> | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>,
  {
    multiOwnerPluginAddress,
    account: account_ = client.account,
  }: {
    multiOwnerPluginAddress?: Address;
  } & GetAccountParameter<TAccount>
): Promise<
  UpgradeToData & {
    createMAAccount: () => Promise<MultiOwnerModularAccount<TSigner>>;
  }
> {
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

export async function getMAInitializationData<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>({
  client,
  multiOwnerPluginAddress,
  signerAddress,
}: {
  multiOwnerPluginAddress?: Address;
  client: SmartAccountClient<TTransport, TChain>;
  signerAddress: Address | Address[];
}): Promise<UpgradeToData> {
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
