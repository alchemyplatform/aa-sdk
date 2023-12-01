import type {
  ISmartAccountProvider,
  ISmartContractAccount,
} from "@alchemy/aa-core";
import {
  encodeAbiParameters,
  encodeFunctionData,
  encodeFunctionResult,
  keccak256,
  parseAbiParameters,
  type Address,
  type Chain,
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
import { MultiOwnerPluginAbi } from "../../plugindefs/multi-owner/abi.js";
import { MultiOwnerPluginAddress } from "../../plugindefs/multi-owner/config.js";
import { UpgradeableModularAccountAbi } from "./abis/UpgradeableModularAccount.js";

// afaik, we've deployed msca only on eth sepolia - will generalize when ready
export const defaultMSCAImplementationAddress =
  "0xb2b748c2557c552B8636862E41aB3649319dD045";

export const getDefaultMSCAFactoryAddress = (chain: Chain): Address => {
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
      return "0xFD14c78640d72f73CC88238E2f7Df3273Ee84043";
  }
  throw new Error(
    `no default light account factory contract exists for ${chain.name}`
  );
};

export const getMSCAInitializationData = async <
  P extends ISmartAccountProvider & { account: ISmartContractAccount }
>(
  provider: P
) => {
  const pluginManifest = await provider.rpcClient.readContract({
    abi: MultiOwnerPluginAbi,
    address: MultiOwnerPluginAddress,
    functionName: "pluginManifest",
  });
  const hashedMultiOwnerPluginManifest = keccak256(
    encodeFunctionResult({
      abi: MultiOwnerPluginAbi,
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
    args: [[MultiOwnerPluginAddress], encodedPluginInitData],
  });

  return encodedMSCAInitializeData;
};
