import {
  AccountNotFoundError,
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  createPublicErc4337FromClient,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
  type GetAccountParameter,
  type OwnedSmartContractAccount,
  type SmartAccountClient,
  type SmartAccountSigner,
  type UpgradeToData,
} from "@alchemy/aa-core";
import type { Address, Chain, Transport } from "viem";
import {
  createPublicClient,
  custom,
  encodeAbiParameters,
  encodeFunctionData,
  encodeFunctionResult,
  keccak256,
  parseAbiParameters,
} from "viem";
import { IPluginAbi } from "./abis/IPlugin.js";
import { MultiOwnerTokenReceiverMSCAFactoryAbi } from "./abis/MultiOwnerTokenReceiverMSCAFactory.js";
import { UpgradeableModularAccountAbi } from "./abis/UpgradeableModularAccount.js";
import {
  createMultiOwnerModularAccount,
  type MultiOwnerModularAccount,
} from "./account/multiOwnerAccount.js";
import { MultiOwnerPlugin } from "./plugins/multi-owner/plugin.js";
import { TokenReceiverPlugin } from "./plugins/token-receiver/plugin.js";

/**
 * Utility method returning the default multi owner msca factory address given a {@link Chain} object
 *
 * @param chain - a {@link Chain} object
 * @returns a {@link Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultMultiOwnerMSCAFactoryAddress = (
  chain: Chain,
  excludeDefaultTokenReceiverPlugin: boolean = false
): Address => {
  switch (chain.id) {
    case sepolia.id:
      return excludeDefaultTokenReceiverPlugin
        ? "0xC69731F267760466663470256A7ba28F79eDC4d6" // MultiOwnerMSCAFactory
        : "0x852B3a676684031Cb77b69B50D8d7879f4c4807d";
    case mainnet.id:
    case goerli.id:
    case polygon.id:
    case polygonMumbai.id:
    case optimism.id:
    case optimismGoerli.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumGoerli.id:
    case arbitrumSepolia.id:
    case base.id:
    case baseGoerli.id:
    case baseSepolia.id:
      throw new Error("not yet deployed");
  }
  throw new Error(
    `no default multi owner msca factory contract exists for ${chain.name}`
  );
};

export async function getMSCAUpgradeToData<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TOwner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends OwnedSmartContractAccount<string, TOwner> | undefined =
    | OwnedSmartContractAccount<string, TOwner>
    | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>,
  {
    multiOwnerPluginAddress,
    tokenReceiverPluginAddress,
    account: account_ = client.account,
  }: {
    multiOwnerPluginAddress?: Address;
    tokenReceiverPluginAddress?: Address;
  } & GetAccountParameter<TAccount>
): Promise<
  UpgradeToData & {
    createMAAccount: () => Promise<MultiOwnerModularAccount<TOwner>>;
  }
> {
  if (!account_) {
    throw new AccountNotFoundError();
  }

  if (!client.chain) {
    throw new Error("client must have a chain");
  }
  const chain = client.chain;
  const account = account_ as OwnedSmartContractAccount<string, TOwner>;

  const factoryAddress = getDefaultMultiOwnerMSCAFactoryAddress(client.chain);

  const implAddress = await client.readContract({
    abi: MultiOwnerTokenReceiverMSCAFactoryAbi,
    address: factoryAddress,
    functionName: "IMPL",
  });

  const multiOwnerAddress =
    multiOwnerPluginAddress ?? MultiOwnerPlugin.meta.addresses[client.chain.id];

  const tokenReceiverAddress =
    tokenReceiverPluginAddress ??
    TokenReceiverPlugin.meta.addresses[client.chain.id];

  if (!multiOwnerAddress) {
    throw new Error("could not get multi owner plugin address");
  }

  if (!tokenReceiverAddress) {
    throw new Error("could not get token receiver plugin address");
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

  const trPluginManifest = await client.readContract({
    abi: IPluginAbi,
    address: tokenReceiverAddress,
    functionName: "pluginManifest",
  });

  const hashedTrPluginManifest = keccak256(
    encodeFunctionResult({
      abi: IPluginAbi,
      functionName: "pluginManifest",
      result: trPluginManifest,
    })
  );

  const ownerAddress = await account.getOwner().getAddress();
  const encodedOwner = encodeAbiParameters(parseAbiParameters("address[]"), [
    [ownerAddress],
  ]);

  const encodedPluginInitData = encodeAbiParameters(
    parseAbiParameters("bytes32[], bytes[]"),
    [
      [hashedMultiOwnerPluginManifest, hashedTrPluginManifest],
      [encodedOwner, "0x"],
    ]
  );

  const encodedMSCAInitializeData = encodeFunctionData({
    abi: UpgradeableModularAccountAbi,
    functionName: "initialize",
    args: [[multiOwnerAddress, tokenReceiverAddress], encodedPluginInitData],
  });

  return {
    implAddress,
    initializationData: encodedMSCAInitializeData,
    createMAAccount: async () =>
      createMultiOwnerModularAccount({
        client: createPublicErc4337FromClient(
          createPublicClient({
            chain: chain as Chain,
            transport: custom(client.transport),
          })
        ),
        owner: account.getOwner(),
        factoryAddress,
        accountAddress: account.address,
      }),
  };
}
