import { type EntryPointVersion } from "@aa-sdk/core";
import { type Address, type Chain } from "viem";
import type { LightAccountBase } from "./accounts/base";

export type LightAccountVersionConfigs = {
  LightAccount: {
    "v1.0.1": LightAccountVersionConfig<"0.6.0">;
    "v1.0.2": LightAccountVersionConfig<"0.6.0">;
    "v1.1.0": LightAccountVersionConfig<"0.6.0">;
    "v2.0.0": LightAccountVersionConfig<"0.7.0">;
  };
  MultiOwnerLightAccount: {
    "v2.0.0": LightAccountVersionConfig<"0.7.0">;
  };
};

/**
 * Light account types supported: LightAccount, MultiOwnerLightAccount
 *
 */
export type LightAccountType = keyof LightAccountVersionConfigs;

export type LightAccountVersionConfig<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  entryPointVersion: TEntryPointVersion;
  addresses: {
    default: {
      factory: Address;
      impl: Address;
    };
    overrides?: Record<
      Chain["id"],
      {
        factory: Address;
        impl: Address;
      }
    >;
  };
};

export type LightAccountVersion<TAccountType extends LightAccountType> =
  keyof LightAccountVersionConfigs[TAccountType];

export type GetLightAccountType<TAccount extends LightAccountBase> =
  TAccount["source"] extends LightAccountType ? TAccount["source"] : never;

export type LightAccountEntryPointVersion<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
> = LightAccountVersionConfigs[TLightAccountType][TLightAccountVersion] extends LightAccountVersionConfig
  ? LightAccountVersionConfigs[TLightAccountType][TLightAccountVersion]["entryPointVersion"]
  : never;
