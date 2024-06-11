import {
  DefaultFactoryNotDefinedError,
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  fraxtal,
  fraxtalSepolia,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
  toRecord,
  zora,
  zoraSepolia,
} from "@alchemy/aa-core";
import { fromHex, type Address, type Chain } from "viem";
import type { LightAccountBase } from "./accounts/base";
import type {
  AccountVersionDef,
  GetLightAccountType,
  GetLightAccountVersion,
  GetLightAccountVersionFromAccount,
  IAccountVersionRegistry,
  LightAccountType,
  LightAccountVersion,
  LightAccountVersionDef,
} from "./types";

/**
 * Light account deployed chains
 *
 */
export const supportedChains: Chain[] = [
  mainnet,
  sepolia,
  goerli,
  polygon,
  polygonAmoy,
  polygonMumbai,
  optimism,
  optimismGoerli,
  optimismSepolia,
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  fraxtal,
  fraxtalSepolia,
  zora,
  zoraSepolia,
];

/**
 * Account version registry interface that defines the light account versions
 * and the version definition for each light account type
 *
 */
export const AccountVersionRegistry: IAccountVersionRegistry = {
  LightAccount: {
    "v1.0.1": {
      type: "LightAccount",
      version: "v1.0.1",
      address: toRecord<Chain, "id", { factory: Address; impl: Address }>(
        supportedChains,
        "id",
        () => ({
          factory:
            "0x000000893A26168158fbeaDD9335Be5bC96592E2".toLowerCase() as Address,
          impl: "0xc1b2fc4197c9187853243e6e4eb5a4af8879a1c0".toLowerCase() as Address,
        })
      ),
      entryPointVersion: "0.6.0",
    },
    "v1.0.2": {
      type: "LightAccount",
      version: "v1.0.2",
      address: toRecord<Chain, "id", { factory: Address; impl: Address }>(
        supportedChains,
        "id",
        () => ({
          factory:
            "0x00000055C0b4fA41dde26A74435ff03692292FBD".toLowerCase() as Address,
          impl: "0x5467b1947F47d0646704EB801E075e72aeAe8113".toLowerCase() as Address,
        })
      ),
      entryPointVersion: "0.6.0",
    },
    "v1.1.0": {
      type: "LightAccount",
      version: "v1.1.0",
      address: toRecord<Chain, "id", { factory: Address; impl: Address }>(
        supportedChains,
        "id",
        () => ({
          factory:
            "0x00004EC70002a32400f8ae005A26081065620D20".toLowerCase() as Address,
          impl: "0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba".toLowerCase() as Address,
        })
      ),
      entryPointVersion: "0.6.0",
    },
    "v2.0.0": {
      type: "LightAccount",
      version: "v2.0.0",
      address: toRecord<Chain, "id", { factory: Address; impl: Address }>(
        supportedChains,
        "id",
        () => ({
          factory:
            "0x0000000000400CdFef5E2714E63d8040b700BC24".toLowerCase() as Address,
          impl: "0x8E8e658E22B12ada97B402fF0b044D6A325013C7".toLowerCase() as Address,
        })
      ),
      entryPointVersion: "0.7.0",
    },
  },
  MultiOwnerLightAccount: {
    "v2.0.0": {
      type: "MultiOwnerLightAccount",
      version: "v2.0.0",
      address: toRecord<Chain, "id", { factory: Address; impl: Address }>(
        supportedChains,
        "id",
        () => ({
          factory:
            "0x000000000019d2Ee9F2729A65AfE20bb0020AefC".toLowerCase() as Address,
          impl: "0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D".toLowerCase() as Address,
        })
      ),
      entryPointVersion: "0.7.0",
    },
  },
};

/**
 * Get the default light account version for the given light account type
 *
 * @template {LightAccountType} TLightAccountType
 * @param type - the light account type to get the default version for
 * @returns the default version for the given light account type
 */
export const defaultLightAccountVersion = <
  TLightAccountType extends LightAccountType
>(
  type: TLightAccountType
): GetLightAccountVersion<TLightAccountType> =>
  (type === "LightAccount"
    ? "v1.1.0"
    : "v2.0.0") as GetLightAccountVersion<TLightAccountType>;

/**
 * Utility method returning the default light account factory address given a {@link Chain} object
 *
 * @param chain - a {@link Chain} object
 * @param version - the version of the light account to get the factory address for
 * @returns a {@link Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultLightAccountFactoryAddress = (
  chain: Chain,
  version: LightAccountVersion = "v1.1.0"
): Address => {
  const address =
    AccountVersionRegistry.LightAccount[version].address[chain.id];
  if (!address)
    throw new DefaultFactoryNotDefinedError("LightAccount", chain, "0.6.0");
  return address.factory;
};

/**
 * Can be used to check if the account with one of the following implementation addresses
 * to not support 1271 signing.
 *
 * Light accounts with versions v1.0.1 and v1.0.2 do not support 1271 signing.
 *
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
 *
 */
export const LightAccountUnsupported1271Factories = new Set(
  LightAccountUnsupported1271Impls.map((x) =>
    Object.values(x.address).map((addr) => addr.factory)
  ).flat()
);

/**
 * Get the light account version definition for the given light account and chain
 *
 * @template {LightAccountBase} TAccount
 * @template {GetLightAccountType<TAccount>} TLightAccountType
 * @template {GetLightAccountVersion<TLightAccountType>} TLightAccountVersion
 * @param account - the light account to get the version for
 * @param chain - the chain to get the version for
 * @returns the light account version definition for the given light account and chain
 */
export async function getLightAccountVersionDef<
  TAccount extends LightAccountBase,
  TLightAccountType extends GetLightAccountType<TAccount> = GetLightAccountType<TAccount>,
  TLightAccountVersion extends GetLightAccountVersion<TLightAccountType> = GetLightAccountVersion<TLightAccountType>
>(
  account: TAccount,
  chain: Chain
): Promise<LightAccountVersionDef<TLightAccountType, TLightAccountVersion>>;

/**
 * Get the light account version definition for the given light account and chain
 *
 * @template {LightAccountBase} TAccount
 * @template {GetLightAccountType<TAccount>} TLightAccountType
 * @param account - the light account to get the version for
 * @param chain - the chain to get the version for
 * @returns the light account version definition for the given light account and chain
 */
export async function getLightAccountVersionDef<
  TAccount extends LightAccountBase,
  TLightAccountType extends GetLightAccountType<TAccount> = GetLightAccountType<TAccount>
>(
  account: TAccount,
  chain: Chain
): Promise<
  AccountVersionDef<
    TLightAccountType,
    GetLightAccountVersion<TLightAccountType>
  >
>;

/**
 * Get the light account version definition for the given light account and chain
 *
 * @template {LightAccountBase} TAccount
 * @param account - the light account to get the version for
 * @param chain - the chain to get the version for
 * @returns the light account version definition for the given light account and chain
 */
export async function getLightAccountVersionDef<
  TAccount extends LightAccountBase
>(account: TAccount, chain: Chain): Promise<AccountVersionDef> {
  const accountType = account.source as LightAccountType;
  const factoryAddress = await account.getFactoryAddress();
  const implAddress = await account.getImplementationAddress();
  const implToVersion = new Map(
    Object.entries(AccountVersionRegistry[accountType])
      .map((pair) => {
        const [version, def] = pair as [
          GetLightAccountVersionFromAccount<TAccount>,
          LightAccountVersionDef
        ];
        return chain.id in def.address
          ? [def.address[chain.id].impl, version]
          : [null, version];
      })
      .filter(([impl]) => impl !== null) as [
      Address,
      keyof IAccountVersionRegistry[typeof accountType]
    ][]
  );

  const factoryToVersion = new Map(
    Object.entries(AccountVersionRegistry[accountType])
      .map((pair) => {
        const [version, def] = pair as [
          keyof IAccountVersionRegistry[typeof accountType],
          LightAccountVersionDef
        ];
        return chain.id in def.address
          ? [def.address[chain.id].factory, version]
          : [null, version];
      })
      .filter(([impl]) => impl !== null) as [
      Address,
      keyof IAccountVersionRegistry[typeof accountType]
    ][]
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

/**
 * @param account - the light account to get the version for
 * @param chain - the chain to get the version for
 *
 * @deprecated don't use this function as this function is replaced with getLightAccountVersionDef.
 *             Migrate to using getLightAccountVersionDef instead
 *
 * @returns the light account version for the given light account and chain
 */
export async function getLightAccountVersion<
  TAccount extends LightAccountBase,
  TLightAccountType extends GetLightAccountType<TAccount> = GetLightAccountType<TAccount>
>(
  account: TAccount,
  chain?: Chain
): Promise<GetLightAccountVersion<TLightAccountType>>;

/**
 * Get the light account version for the given light account and chain
 *
 * @deprecated don't use this function as this function is replaced with getLightAccountVersionDef.
 *
 * @param account - the light account to get the version for
 * @param chain - the chain to get the version for
 * @returns the light account version for the given light account and chain
 */
export async function getLightAccountVersion(
  account: LightAccountBase,
  chain: Chain = supportedChains[0]
): Promise<LightAccountVersion> {
  return (await getLightAccountVersionDef(account, chain)).version;
}
