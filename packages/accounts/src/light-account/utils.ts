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
  polygonAmoy,
  polygonMumbai,
  sepolia,
  toRecord,
  type EntryPointVersion,
  type GetAccountParameter,
  type OneOf,
  type SmartAccountSigner,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { fromHex, type Address, type Chain } from "viem";
import type { LightAccountBase } from "./accounts/base";

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
];

export type LightAccountType = "LightAccount" | "MultiOwnerLightAccount";

export type AccountVersionDef<
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = {
  type: TLightAccountType;
  version: TLightAccountVersion;
  entryPointVersion: TEntryPointVersion;
  address: Record<
    Chain["id"],
    {
      factory: Address;
      impl: Address;
    }
  >;
};

export type LightAccountVersion<
  TLightAccountType extends LightAccountType = LightAccountType
> = keyof IAccountVersionRegistry[TLightAccountType];

export type LightAccountVersionDef<
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>
> = IAccountVersionRegistry[TLightAccountType][TLightAccountVersion];

export interface IAccountVersionRegistry {
  LightAccount: {
    /** @deprecated This version does not support 1271 signature validation */
    "v1.0.1": AccountVersionDef<"LightAccount", "v1.0.1", "0.6.0">;
    /** @deprecated This version has a known issue with 1271 validation */
    "v1.0.2": AccountVersionDef<"LightAccount", "v1.0.2", "0.6.0">;
    "v1.1.0": AccountVersionDef<"LightAccount", "v1.1.0", "0.6.0">;
    /** LightAccount v2 Changelog.
     * It is recommended to use v2.0.0
     * https://alchemotion.notion.site/External-Light-Account-v2-Changelog-725b306ab1e04eb0a3e596521dd8f0bd */
    "v2.0.0": AccountVersionDef<"LightAccount", "v2.0.0", "0.7.0">;
  };
  MultiOwnerLightAccount: {
    /** MultiOwnerLightAccount v2 Changelog
     * It is recommended to use v2.0.0
     * https://alchemotion.notion.site/External-Light-Account-v2-Changelog-725b306ab1e04eb0a3e596521dd8f0bd */
    "v2.0.0": AccountVersionDef<"MultiOwnerLightAccount", "v2.0.0", "0.7.0">;
  };
}

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
            "0x19B486A57C790b47Ee2E967c2aB1b8BbAeAeE7bB".toLowerCase() as Address,
          impl: "0x118c4EA651e2fE5F5637f5D8A473CB8329251f89".toLowerCase() as Address,
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
        [arbitrumSepolia],
        "id",
        () => ({
          factory:
            "0xEEeB9dD9DA59bD3020C548D3543485E37ee8A50e".toLowerCase() as Address,
          impl: "0x0C93750D969bdeb51547766680E5CA14A508758e".toLowerCase() as Address,
        })
      ),
      entryPointVersion: "0.7.0",
    },
  },
};

export const defaultLightAccountVersion = <
  TLightAccountType extends LightAccountType
>(
  type: TLightAccountType
): LightAccountVersion<TLightAccountType> =>
  (type === "LightAccount"
    ? "v1.1.0"
    : "v2.0.0") as LightAccountVersion<TLightAccountType>;

/**
 * Example Usage:
 *
 * type T1 = GetLightAccountVersionsForType<"LightAccount">;
 * const t1: T1 = AccountVersionRegistry.LightAccount["v1.0.2"];
 */
export type GetLightAccountVersionDefsForType<TType extends LightAccountType> =
  Extract<
    IAccountVersionRegistry[TType][keyof IAccountVersionRegistry[TType]],
    { type: TType }
  >;

export type GetLightAccountVersionDef<
  TType extends LightAccountType,
  TLightAccountVersion extends LightAccountVersion<TType>
> = IAccountVersionRegistry[TType][TLightAccountVersion];

/**
 * Example Usage:
 *
 * type T = GetLightAccountVersionDefsForEntryPoint<"LightAccount", "0.6.0">;
 * const t_1: T = AccountVersionRegistry.LightAccount["v1.0.2"]; // compiles
 * const t_2: T = AccountVersionRegistry.LightAccount["v2.0.0"]; // errors
 */
export type GetLightAccountVersionDefsForEntryPoint<
  TType extends LightAccountType,
  TEntryPointVersion extends EntryPointVersion
> = Extract<
  GetLightAccountVersionDefsForType<TType>,
  { entryPointVersion: TEntryPointVersion }
>;

export type GetLightAccountType<
  TAccount extends LightAccountBase | undefined,
  TAccountOverride extends LightAccountBase = LightAccountBase
> = GetAccountParameter<TAccount, TAccountOverride> extends LightAccountBase<
  SmartAccountSigner,
  infer TLightAccountType
>
  ? OneOf<TLightAccountType, LightAccountType>
  : LightAccountType;

export type GetEntryPointForLightAccountVersion<
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>
> = GetLightAccountVersionDef<
  TLightAccountType,
  TLightAccountVersion
> extends AccountVersionDef<
  TLightAccountType,
  TLightAccountVersion,
  infer TEntryPointVersion
>
  ? TEntryPointVersion
  : EntryPointVersion;

export type GetLightAccountTypesForVersion<
  TLightAccountVersion extends LightAccountVersion = LightAccountVersion
> = TLightAccountVersion extends LightAccountVersion<infer TLightAccountType>
  ? TLightAccountType
  : LightAccountType;

export const LightAccountUnsupported1271Impls = [
  AccountVersionRegistry.LightAccount["v1.0.1"],
  AccountVersionRegistry.LightAccount["v1.0.2"],
];

export const LightAccountUnsupported1271Factories = new Set(
  LightAccountUnsupported1271Impls.map((x) =>
    Object.values(x.address).map((addr) => addr.factory)
  ).flat()
);

export async function getLightAccountVersionDef<
  TAccount extends LightAccountBase,
  TLightAccountType extends GetLightAccountType<TAccount> = GetLightAccountType<TAccount>
>(
  account: TAccount,
  chain: Chain
): Promise<LightAccountVersionDef<TLightAccountType>>;

export async function getLightAccountVersionDef(
  account: SmartContractAccount,
  chain: Chain
): Promise<LightAccountVersionDef> {
  const accountType = account.source as LightAccountType;
  const factoryAddress = account.getFactoryAddress();
  const implAddress = await account.getImplementationAddress();
  const implToVersion = new Map(
    Object.entries(AccountVersionRegistry[accountType])
      .map((pair) => {
        const [version, def] = pair as [
          LightAccountVersion,
          LightAccountVersionDef
        ];
        return chain.id in def.address
          ? [def.address[chain.id].impl, version]
          : [null, version];
      })
      .filter(([impl]) => impl !== null) as [Address, LightAccountVersion][]
  );

  const factoryToVersion = new Map(
    Object.entries(AccountVersionRegistry[accountType])
      .map((pair) => {
        const [version, def] = pair as [
          LightAccountVersion,
          LightAccountVersionDef
        ];
        return chain.id in def.address
          ? [def.address[chain.id].factory, version]
          : [null, version];
      })
      .filter(([impl]) => impl !== null) as [Address, LightAccountVersion][]
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
