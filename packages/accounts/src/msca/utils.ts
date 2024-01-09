import type {
  ISmartAccountProvider,
  ISmartContractAccount,
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
import { UpgradeableModularAccountAbi } from "./abis/UpgradeableModularAccount.js";

// afaik, we've deployed msca only on eth sepolia - will generalize when ready
export const defaultMSCAImplementationAddress =
  "0xb2b748c2557c552B8636862E41aB3649319dD045";

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
    case mainnet.id:
    case sepolia.id:
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
      return excludeDefaultTokenReceiverPlugin
        ? "0xFD14c78640d72f73CC88238E2f7Df3273Ee84043" // MultiOwnerMSCAFactory
        : "0x22322E35c1850F26DD54Ed8F59a27C1c79847A15"; // MultiOwnerTokenReceiverMSCAFactory
  }
  throw new Error(
    `no default multi owner msca factory contract exists for ${chain.name}`
  );
};

export const getMSCAInitializationData = async <
  P extends ISmartAccountProvider & { account: ISmartContractAccount }
>(
  provider: P,
  multiOwnerPluginAddress: Address
) => {
  const pluginManifest = await provider.rpcClient.readContract({
    abi: IPluginAbi,
    address: multiOwnerPluginAddress,
    functionName: "pluginManifest",
  });
  const hashedMultiOwnerPluginManifest = keccak256(
    encodeFunctionResult({
      abi: IPluginAbi,
      functionName: "pluginManifest",
      result: pluginManifest,
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
    [[hashedMultiOwnerPluginManifest], [encodedOwner]]
  );

  const encodedMSCAInitializeData = encodeFunctionData({
    abi: UpgradeableModularAccountAbi,
    functionName: "initialize",
    args: [[multiOwnerPluginAddress], encodedPluginInitData],
  });

  return encodedMSCAInitializeData;
};
