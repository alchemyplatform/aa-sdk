import { BaseError, ChainNotFoundError } from "@alchemy/common";
import { hexToBigInt, hexToNumber, trim, type Address, type Chain } from "viem";
import { getStorageAt } from "viem/actions";
import type { LightAccountBase } from "./accounts/base";
import type {
  LightAccountType,
  LightAccountVersion,
  LightAccountVersionConfig,
  LightAccountVersionConfigs,
} from "./types";

export const lowerAddress = (addr: Address): Address =>
  addr.toLowerCase() as Address;

/**
 * Account version registry interface that defines the light account versions
 * and the version definition for each light account type
 *
 */
export const AccountVersionRegistry: LightAccountVersionConfigs = {
  LightAccount: {
    "v1.0.1": {
      entryPointVersion: "0.6",
      addresses: {
        default: {
          factory: lowerAddress("0x000000893A26168158fbeaDD9335Be5bC96592E2"),
          impl: lowerAddress("0xc1b2fc4197c9187853243e6e4eb5a4af8879a1c0"),
        },
      },
    },
    "v1.0.2": {
      entryPointVersion: "0.6",
      addresses: {
        default: {
          factory: lowerAddress("0x00000055C0b4fA41dde26A74435ff03692292FBD"),
          impl: lowerAddress("0x5467b1947F47d0646704EB801E075e72aeAe8113"),
        },
      },
    },
    "v1.1.0": {
      entryPointVersion: "0.6",
      addresses: {
        default: {
          factory: lowerAddress("0x00004EC70002a32400f8ae005A26081065620D20"),
          impl: lowerAddress("0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba"),
        },
      },
    },
    "v2.0.0": {
      entryPointVersion: "0.7",
      addresses: {
        default: {
          factory: lowerAddress("0x0000000000400CdFef5E2714E63d8040b700BC24"),
          impl: lowerAddress("0x8E8e658E22B12ada97B402fF0b044D6A325013C7"),
        },
      },
    },
  },
  MultiOwnerLightAccount: {
    "v2.0.0": {
      entryPointVersion: "0.7",
      addresses: {
        default: {
          factory: lowerAddress("0x000000000019d2Ee9F2729A65AfE20bb0020AefC"),
          impl: lowerAddress("0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D"),
        },
      },
    },
  },
};

// TODO(v5): The pattern of getDefaultXYZAddress(…) doesn’t really make sense as a standalone.
// We built this expecting lots of diverging addresses per chain, but in practice we have none
// (and we’ve turned down things that require this). Instead: we could build the
// default-but-overridable behavior into the consuming functions themselves (i.e.
// createLightAccount defaulting to a factory address, but make it overridable)

/**
 * Get the default light account version for the given light account type
 *
 * @template {LightAccountType} TLightAccountType
 * @returns {LightAccountVersion<TLightAccountType>} the default version for the given light account type
 */
export const defaultLightAccountVersion = <
  TLightAccountType extends LightAccountType,
>(): LightAccountVersion<TLightAccountType> => "v2.0.0";

/**
 * Utility method returning the default light account factory address given a Chain object
 *
 * @param {Chain} chain - a Chain object
 * @param {LightAccountVersion} version - the version of the light account to get the factory address for
 * @returns {Address} address for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultLightAccountFactoryAddress = (
  chain: Chain,
  version: LightAccountVersion<"LightAccount">,
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
 * @param {LightAccountVersion<"LightAccount">} version - the version of the light account to get the factory address for
 * @returns {Address} an Address for the given chain
 */
export const getDefaultMultiOwnerLightAccountFactoryAddress = (
  chain: Chain,
  version: LightAccountVersion<"MultiOwnerLightAccount">,
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
  ]).flat(),
);

export const EIP1967_PROXY_IMPL_STORAGE_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

/**
 * Get the light account implementation address for the given light account
 *
 * @param {LightAccountBase} account - the light account to get the implementation address for
 * @returns {Promise<Address>} the light account implementation address for the given light account
 */
export async function getLightAccountImplAddress<
  TAccount extends LightAccountBase,
>(account: TAccount): Promise<Address> {
  const client = account.client;
  const chain = client.chain;
  if (!chain) {
    throw new ChainNotFoundError();
  }
  const version = account.getLightAccountVersion();
  const type = account.source;

  const expectedImplAddresses = Object.values(AccountVersionRegistry[type]).map(
    (x) => x.addresses.overrides?.[chain.id]?.impl ?? x.addresses.default.impl,
  );

  const storage = await getStorageAt(client, {
    address: account.address,
    slot: EIP1967_PROXY_IMPL_STORAGE_SLOT,
  });

  if (storage == null) {
    throw new BaseError(
      `Failed to get storage slot: ${EIP1967_PROXY_IMPL_STORAGE_SLOT}`,
    );
  }

  if (
    hexToNumber(storage) !== 0 &&
    !expectedImplAddresses.some((x) => x === lowerAddress(trim(storage)))
  ) {
    throw new BaseError(
      `could not determine if smart account implementation is ${type} ${String(
        version,
      )}`,
    );
  }

  return trim(storage);
}

/**
 * Get the light account version definition for the given light account and chain
 *
 * @template {LightAccountBase} TAccount
 * @param {LightAccountBase} account the light account to get the version for
 * @param {Chain} chain - the chain to get the version for
 * @returns {Promise<LightAccountVersionConfig>} the light account version definition for the given light account and chain
 */
export async function getLightAccountVersionForAccount<
  TAccount extends LightAccountBase,
>(account: TAccount, chain: Chain): Promise<LightAccountVersionConfig> {
  const type = account.source;

  const { factory } = await account.getFactoryArgs();
  const impl = await getLightAccountImplAddress(account);

  const implToVersion = new Map(
    (
      Object.entries(AccountVersionRegistry[type]) as [
        LightAccountVersion<LightAccountType>,
        LightAccountVersionConfig<TAccount["entryPoint"]["version"]>,
      ][]
    ).map(([version, def]) => {
      if (
        def.addresses.overrides != null &&
        chain.id in def.addresses.overrides
      ) {
        return [def.addresses.overrides[chain.id].impl, version];
      }

      return [def.addresses.default.impl, version];
    }),
  );

  const factoryToVersion = new Map(
    (
      Object.entries(AccountVersionRegistry[type]) as [
        LightAccountVersion<LightAccountType>,
        LightAccountVersionConfig<TAccount["entryPoint"]["version"]>,
      ][]
    ).map(([version, def]) => {
      if (
        def.addresses.overrides != null &&
        chain.id in def.addresses.overrides
      ) {
        return [def.addresses.overrides[chain.id].factory, version];
      }

      return [def.addresses.default.factory, version];
    }),
  );

  const version =
    hexToBigInt(impl) !== 0n
      ? implToVersion.get(lowerAddress(impl))
      : factory
        ? factoryToVersion.get(lowerAddress(factory))
        : undefined;

  if (!version) {
    throw new BaseError(
      `Could not determine ${account.source} version for chain ${chain.id}`,
    );
  }

  return AccountVersionRegistry[type][version];
}
