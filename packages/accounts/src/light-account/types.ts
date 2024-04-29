import {
  type EntryPointVersion,
  type GetAccountParameter,
  type OneOf,
  type SmartAccountSigner,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { type Address, type Chain } from "viem";
import type { LightAccountBase } from "./accounts/base";

/**
 * Light account types supported: LightAccount, MultiOwnerLightAccount
 *
 */
export type LightAccountType = keyof IAccountVersionRegistry;

/**
 * Account version definition, which is the base type defining the LightAccountVersionDef interface
 *
 * @template {LightAccountType} TLightAccountType type
 * @template {GetLightAccountVersion<TLightAccountType>} TLightAccountVersion version
 * @template {EntryPointVersion} TEntryPointVersion entryPointVersion
 */
export type AccountVersionDef<
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends GetLightAccountVersion<TLightAccountType> = GetLightAccountVersion<TLightAccountType>,
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

/**
 * Light account version type defs for tightly coupled types for smart accounts
 *
 */
export type LightAccountVersion =
  | keyof IAccountVersionRegistry["LightAccount"]
  | keyof IAccountVersionRegistry["MultiOwnerLightAccount"];

/**
 * Get the light account versions available for the given light account type
 *
 * @template {LightAccountType} TLightAccountType
 */
export type GetLightAccountVersion<
  TLightAccountType extends LightAccountType = LightAccountType
> = keyof IAccountVersionRegistry[TLightAccountType];

/**
 * Light account version definition type based on the light account type and version
 *
 * @template {LightAccountType} TLightAccountType
 * @template {GetLightAccountVersion<TLightAccountType>} TLightAccountVersion
 */
export type LightAccountVersionDef<
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends GetLightAccountVersion<TLightAccountType> = GetLightAccountVersion<TLightAccountType>
> = IAccountVersionRegistry[TLightAccountType][TLightAccountVersion];

/**
 * Light account version registry interface defining the supported light account versions
 *
 */
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
 * Get the light account version definitions available for the given light account type
 *
 * @template {LightAccountType} TLightAccountType
 *
 * @example
 * type T1 = GetLightAccountVersionsForType<"LightAccount">;
 * const t1: T1 = AccountVersionRegistry.LightAccount["v1.0.2"];
 */
export type GetLightAccountVersionDefsForType<TType extends LightAccountType> =
  Extract<
    IAccountVersionRegistry[TType][keyof IAccountVersionRegistry[TType]],
    { type: TType }
  >;

/**
 * Get the light account version definition for the given light account type and version
 *
 * @template {LightAccountType} TType
 * @template {GetLightAccountVersion<TType>} TLightAccountVersion
 */
export type GetLightAccountVersionDef<
  TType extends LightAccountType,
  TLightAccountVersion extends GetLightAccountVersion<TType>
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

/**
 * Get the light account type for the given light account by inferring from its type definition
 *
 * @template {SmartContractAccount | undefined} TAccount
 * @template {SmartContractAccount} TAccountOverride
 */
export type GetLightAccountType<
  TAccount extends SmartContractAccount | undefined,
  TAccountOverride extends SmartContractAccount = SmartContractAccount
> = GetAccountParameter<TAccount, TAccountOverride> extends LightAccountBase<
  SmartAccountSigner,
  infer TLightAccountType
>
  ? OneOf<TLightAccountType, LightAccountType>
  : LightAccountType;

/**
 * Get the light account version for the given light account by inferring from its type definition
 *
 * @template {LightAccountBase | undefined} TAccount
 * @template {LightAccountBase} TAccountOverride
 */
export type GetLightAccountVersionFromAccount<
  TAccount extends LightAccountBase | undefined,
  TAccountOverride extends LightAccountBase = LightAccountBase
> = GetAccountParameter<TAccount, TAccountOverride> extends LightAccountBase<
  SmartAccountSigner,
  LightAccountType,
  infer TLightAccountVersion
>
  ? OneOf<TLightAccountVersion, LightAccountVersion>
  : LightAccountVersion;

/**
 * Get the entry point version supported for the given light account type and version
 *
 * @template {LightAccountType} TLightAccountType
 * @template {GetLightAccountVersion<TLightAccountType>} TLightAccountVersion
 */
export type GetEntryPointForLightAccountVersion<
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends GetLightAccountVersion<TLightAccountType> = GetLightAccountVersion<TLightAccountType>
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

/**
 * Get the light account type for the given light account version by inferring from its type definition
 *
 * @template {LightAccountVersion} TLightAccountVersion
 */
export type GetLightAccountTypesForVersion<
  TLightAccountVersion extends LightAccountVersion = LightAccountVersion
> = TLightAccountVersion extends GetLightAccountVersion<infer TLightAccountType>
  ? TLightAccountType
  : LightAccountType;

/**
 * Get default light account version for the given light account type
 *
 * @template {LightAccountType} TLightAccountType
 */
export type GetDefaultLightAccountVersion<
  TLightAccountType extends LightAccountType = LightAccountType
> = TLightAccountType extends "MultiOwnerLightAccount"
  ? "v2.0.0" & LightAccountVersion
  : "v1.1.0" & LightAccountVersion;
