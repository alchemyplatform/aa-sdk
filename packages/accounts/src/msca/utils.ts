import type {
  ISmartAccountProvider,
  ISmartContractAccount,
  UpgradeToData,
} from "@alchemy/aa-core";
import type { Address, Chain } from "viem";
import {
  encodeAbiParameters,
  encodeFunctionData,
  encodeFunctionResult,
  keccak256,
  parseAbiParameters,
} from "viem";
import {
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
  polygonMumbai,
  sepolia,
} from "viem/chains";
import { IPluginAbi } from "./abis/IPlugin.js";
import { MultiOwnerTokenReceiverMSCAFactoryAbi } from "./abis/MultiOwnerTokenReceiverMSCAFactory.js";
import { UpgradeableModularAccountAbi } from "./abis/UpgradeableModularAccount.js";
import { createMultiOwnerMSCA } from "./multi-owner-account.js";
import { MultiOwnerPlugin } from "./plugins/multi-owner/index.js";
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

export const getMSCAUpgradeToData = async <
  P extends ISmartAccountProvider & { account: ISmartContractAccount }
>(
  provider: P,
  multiOwnerPluginAddress?: Address,
  tokenReceiverPluginAddress?: Address
): Promise<
  UpgradeToData & {
    connectFn: (
      rpcClient: P["rpcClient"]
    ) => ReturnType<typeof createMultiOwnerMSCA>;
  }
> => {
  const factoryAddress = getDefaultMultiOwnerMSCAFactoryAddress(
    provider.rpcClient.chain
  );
  const accountAddress = await provider.getAddress();

  const implAddress = await provider.rpcClient.readContract({
    abi: MultiOwnerTokenReceiverMSCAFactoryAbi,
    address: factoryAddress,
    functionName: "IMPL",
  });

  const multiOwnerAddress =
    multiOwnerPluginAddress ??
    MultiOwnerPlugin.meta.addresses[provider.rpcClient.chain.id];

  const tokenReceiverAddress =
    tokenReceiverPluginAddress ??
    TokenReceiverPlugin.meta.addresses[provider.rpcClient.chain.id];

  if (!multiOwnerAddress) {
    throw new Error("could not get multi owner plugin address");
  }

  if (!tokenReceiverAddress) {
    throw new Error("could not get token receiver plugin address");
  }

  const moPluginManifest = await provider.rpcClient.readContract({
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

  const trPluginManifest = await provider.rpcClient.readContract({
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

  const owner = provider.account.getOwner();
  if (owner == null) {
    throw new Error("could not get owner");
  }

  const ownerAddress = await owner.getAddress();
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
    connectFn: (rpcClient: P["rpcClient"]) =>
      createMultiOwnerMSCA({
        rpcClient,
        owner,
        entryPointAddress: provider.account.getEntryPointAddress(),
        factoryAddress,
        chain: rpcClient.chain,
        accountAddress,
      }),
  };
};
