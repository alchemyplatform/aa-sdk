import type { Abi, Address } from "viem";
import type { LightAccountBase } from "./accounts/base.js";
import {
  lightAccountStaticImplV1_0_1,
  lightAccountStaticImplV1_0_2,
  lightAccountStaticImplV1_1_0,
  lightAccountStaticImplV2_0_0,
  multiOwnerLightAccountStaticImplV2_0_0,
} from "./lightAccountStaticImpl.js";
import type { StaticSmartAccountImplementation } from "../types.js";

/**
 * Account version registry interface that defines the light account versions
 * and the version definition for each light account type
 *
 */
export const AccountVersionRegistry = {
  LightAccount: {
    "v1.0.1": lightAccountStaticImplV1_0_1,
    "v1.0.2": lightAccountStaticImplV1_0_2,
    "v1.1.0": lightAccountStaticImplV1_1_0,
    "v2.0.0": lightAccountStaticImplV2_0_0,
  },
  MultiOwnerLightAccount: {
    "v2.0.0": multiOwnerLightAccountStaticImplV2_0_0,
  },
} satisfies Record<string, Record<string, StaticSmartAccountImplementation>>;

export type LightAccountType = Extract<
  keyof typeof AccountVersionRegistry,
  "LightAccount" | "MultiOwnerLightAccount"
>;

export type LightAccountVersion<TAccountType extends LightAccountType> =
  keyof (typeof AccountVersionRegistry)[TAccountType];

export type GetLightAccountType<TAccount extends LightAccountBase> =
  TAccount["source"] extends LightAccountType ? TAccount["source"] : never;

/**
 * Infers the EntryPoint details as a type, given the account type and version.
 */
export type EntryPointFromAccountRegistry<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
> =
  (typeof AccountVersionRegistry)[TLightAccountType][TLightAccountVersion] extends StaticSmartAccountImplementation<
    infer _7702,
    infer entryPointVersion,
    infer _factoryArgs,
    infer entryPointAbi extends Abi
  >
    ? (typeof AccountVersionRegistry)[TLightAccountType][TLightAccountVersion]["entryPoint"] extends {
        readonly version: entryPointVersion;
        readonly address: Address;
        readonly abi: entryPointAbi;
      }
      ? (typeof AccountVersionRegistry)[TLightAccountType][TLightAccountVersion]["entryPoint"]
      : never
    : never;
