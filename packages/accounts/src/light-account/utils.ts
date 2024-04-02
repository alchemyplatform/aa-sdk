import {
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
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { fromHex, type Address, type Chain } from "viem";

export type LightAccountVersion =
  /** @deprecated This version does not support 1271 signature validation */
  | "v1.0.1"
  /** @deprecated This version has a known issue with 1271 validation, it is recommended to use v1.1.0 */
  | "v1.0.2"
  | "v1.1.0";

export const LightAccountVersions: Record<
  LightAccountVersion,
  {
    factoryAddress: Address;
    implAddress: Address;
  }
> = {
  "v1.0.1": {
    factoryAddress:
      "0x000000893A26168158fbeaDD9335Be5bC96592E2".toLowerCase() as Address,
    implAddress:
      "0xc1b2fc4197c9187853243e6e4eb5a4af8879a1c0".toLowerCase() as Address,
  },
  "v1.0.2": {
    factoryAddress:
      "0x00000055C0b4fA41dde26A74435ff03692292FBD".toLowerCase() as Address,
    implAddress:
      "0x5467b1947F47d0646704EB801E075e72aeAe8113".toLowerCase() as Address,
  },
  "v1.1.0": {
    factoryAddress:
      "0x00004EC70002a32400f8ae005A26081065620D20".toLowerCase() as Address,
    implAddress:
      "0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba".toLowerCase() as Address,
  },
};

/**
 * Utility method returning the default light account factory address given a {@link Chain} object
 *
 * @param chain - a {@link Chain} object
 * @returns a {@link Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultLightAccountFactoryAddress = (
  chain: Chain,
  version: LightAccountVersion = "v1.1.0"
): Address => {
  switch (chain.id) {
    case mainnet.id:
    case sepolia.id:
    case goerli.id:
    case polygon.id:
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
    case baseSepolia.id:
      return LightAccountVersions[version].factoryAddress;
  }

  throw new DefaultFactoryNotDefinedError("LightAccount", chain);
};

export const LightAccountUnsupported1271Impls = [
  LightAccountVersions["v1.0.1"],
  LightAccountVersions["v1.0.2"],
];

export const LightAccountUnsupported1271Factories = new Set(
  LightAccountUnsupported1271Impls.map((x) => x.factoryAddress)
);

export const getLightAccountVersion = async <A extends SmartContractAccount>(
  account: A
) => {
  const implAddress = await account.getImplementationAddress();
  const implToVersion = new Map(
    Object.entries(LightAccountVersions).map(([key, value]) => [
      value.implAddress,
      key as LightAccountVersion,
    ])
  );

  const factoryToVersion = new Map(
    Object.entries(LightAccountVersions).map(([key, value]) => [
      value.factoryAddress,
      key as LightAccountVersion,
    ])
  );

  const version =
    fromHex(implAddress, "bigint") === 0n
      ? factoryToVersion.get(
          account.getFactoryAddress().toLowerCase() as Address
        )
      : implToVersion.get(implAddress.toLowerCase() as Address);

  if (!version) {
    throw new Error("Could not determine LightAccount version");
  }

  return version;
};
