import type { GetEntryPointFromAccount } from "@aa-sdk/core";
import { fromHex, type Address, type Chain } from "viem";
import type { LightAccountBase } from "./accounts/base";
import type {
  LightAccountType,
  LightAccountVersion,
  LightAccountVersionConfig,
  LightAccountVersionConfigs,
} from "./types";

/**
 * Account version registry interface that defines the light account versions
 * and the version definition for each light account type
 *
 */
export const AccountVersionRegistry: LightAccountVersionConfigs = {
  LightAccount: {
    "v1.0.1": {
      entryPointVersion: "0.6.0",
      addresses: {
        default: {
          factory:
            "0x000000893A26168158fbeaDD9335Be5bC96592E2".toLowerCase() as Address,
          impl: "0xc1b2fc4197c9187853243e6e4eb5a4af8879a1c0".toLowerCase() as Address,
        },
      },
    },
    "v1.0.2": {
      entryPointVersion: "0.6.0",
      addresses: {
        default: {
          factory:
            "0x00000055C0b4fA41dde26A74435ff03692292FBD".toLowerCase() as Address,
          impl: "0x5467b1947F47d0646704EB801E075e72aeAe8113".toLowerCase() as Address,
        },
      },
    },
    "v1.1.0": {
      entryPointVersion: "0.6.0",
      addresses: {
        default: {
          factory:
            "0x00004EC70002a32400f8ae005A26081065620D20".toLowerCase() as Address,
          impl: "0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba".toLowerCase() as Address,
        },
      },
    },
    "v2.0.0": {
      entryPointVersion: "0.7.0",
      addresses: {
        default: {
          factory:
            "0x0000000000400CdFef5E2714E63d8040b700BC24".toLowerCase() as Address,
          impl: "0x8E8e658E22B12ada97B402fF0b044D6A325013C7".toLowerCase() as Address,
        },
      },
    },
  },
  MultiOwnerLightAccount: {
    "v2.0.0": {
      entryPointVersion: "0.7.0",
      addresses: {
        default: {
          factory:
            "0x000000000019d2Ee9F2729A65AfE20bb0020AefC".toLowerCase() as Address,
          impl: "0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D".toLowerCase() as Address,
        },
      },
    },
  },
};

/**
 * Get the default light account version for the given light account type
 *
 * @template {LightAccountType} TLightAccountType
 * @returns {LightAccountVersion<TLightAccountType>} the default version for the given light account type
 */
export const defaultLightAccountVersion = <
  TLightAccountType extends LightAccountType
>(): LightAccountVersion<TLightAccountType> => "v2.0.0";

/**
 * Utility method returning the default light account factory address given a Chain object
 *
 * @param {Chain} chain - a Chain object
 * @param {LightAccountVersion} version - the version of the light account to get the factory address for
 * @returns {Address} an for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultLightAccountFactoryAddress = (
  chain: Chain,
  version: LightAccountVersion<"LightAccount">
): Address => {
  return (
    AccountVersionRegistry.LightAccount[version].addresses.overrides?.[chain.id]
      ?.factory ??
    AccountVersionRegistry.LightAccount[version].addresses.default.factory
  );
};

/**
 * Utility method returning the default multi owner light account factory address given a Chain object
 *
 * @param {Chain} chain - a Chain object
 * @param {string} version - the version of the light account to get the factory address for
 * @returns {Address} an Address for the given chain
 */
export const getDefaultMultiOwnerLightAccountFactoryAddress = (
  chain: Chain,
  version: LightAccountVersion<"MultiOwnerLightAccount">
) => {
  return (
    AccountVersionRegistry.MultiOwnerLightAccount[version].addresses
      .overrides?.[chain.id]?.factory ??
    AccountVersionRegistry.MultiOwnerLightAccount[version].addresses.default
      .factory
  );
};

/**
 * Can be used to check if the account with one of the following implementation addresses
 * to not support 1271 signing.
 *
 * Light accounts with versions v1.0.1 and v1.0.2 do not support 1271 signing.
 */
export const LightAccountUnsupported1271Impls = [
  AccountVersionRegistry.LightAccount["v1.0.1"],
  AccountVersionRegistry.LightAccount["v1.0.2"],
];

/**
 * Can be used to check if the account with one of the following factory addresses
 * to not support 1271 signing.
 *
 * Light accounts with versions v1.0.1 and v1.0.2 do not support 1271 signing.
 */
export const LightAccountUnsupported1271Factories = new Set(
  LightAccountUnsupported1271Impls.map((x) => [
    x.addresses.default.factory,
    ...Object.values(x.addresses.overrides ?? {}).map((z) => z.factory),
  ]).flat()
);

/**
 * Get the light account version definition for the given light account and chain
 *
 * @template {LightAccountBase} TAccount
 * @param {LightAccountBase} account the light account to get the version for
 * @param {Chain} chain - the chain to get the version for
 * @returns {Promise<LightAccountVersionConfig>} the light account version definition for the given light account and chain
 */
export async function getLightAccountVersionForAccount<
  TAccount extends LightAccountBase
>(account: TAccount, chain: Chain): Promise<LightAccountVersionConfig> {
  const accountType = account.source as LightAccountType;
  const factoryAddress = await account.getFactoryAddress();
  const implAddress = await account.getImplementationAddress();
  const implToVersion = new Map(
    Object.entries(AccountVersionRegistry[accountType]).map((pair) => {
      const [version, def] = pair as [
        LightAccountVersion<LightAccountType>,
        LightAccountVersionConfig<GetEntryPointFromAccount<TAccount>>
      ];

      if (
        def.addresses.overrides != null &&
        chain.id in def.addresses.overrides!
      ) {
        return [def.addresses.overrides[chain.id].impl, version];
      }

      return [def.addresses.default.impl, version];
    })
  );

  const factoryToVersion = new Map(
    Object.entries(AccountVersionRegistry[accountType]).map((pair) => {
      const [version, def] = pair as [
        LightAccountVersion<LightAccountType>,
        LightAccountVersionConfig<GetEntryPointFromAccount<TAccount>>
      ];

      if (
        def.addresses.overrides != null &&
        chain.id in def.addresses.overrides!
      ) {
        return [def.addresses.overrides[chain.id].factory, version];
      }

      return [def.addresses.default.factory, version];
    })
  );

  const version =
    fromHex(implAddress, "bigint") === 0n
      ? factoryToVersion.get(factoryAddress.toLowerCase() as Address)
      : implToVersion.get(implAddress.toLowerCase() as Address);

  if (!version) {
    throw new Error(
      `Could not determine ${account.source} version for chain ${chain.id}`
    );
  }

  return AccountVersionRegistry[accountType][version];
}
