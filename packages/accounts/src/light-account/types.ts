import {
  type EntryPointVersion,
  type GetAccountParameter,
  type OneOf,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { type Address, type Chain } from "viem";
import type { LightAccountBase } from "./accounts/base";

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
    /**
     * LightAccount v2 Changelog.
     * It is recommended to use v2.0.0
     * https://alchemotion.notion.site/External-Light-Account-v2-Changelog-725b306ab1e04eb0a3e596521dd8f0bd
     */
    "v2.0.0": AccountVersionDef<"LightAccount", "v2.0.0", "0.7.0">;
  };
  MultiOwnerLightAccount: {
    /**
     * MultiOwnerLightAccount v2 Changelog
     * It is recommended to use v2.0.0
     * https://alchemotion.notion.site/External-Light-Account-v2-Changelog-725b306ab1e04eb0a3e596521dd8f0bd
     */
    "v2.0.0": AccountVersionDef<"MultiOwnerLightAccount", "v2.0.0", "0.7.0">;
  };
}

/**
 * @example
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
 * @example
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
