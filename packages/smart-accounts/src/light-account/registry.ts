import type { Abi, Address } from "viem";
import type { LightAccountBase } from "./accounts/base.js";
import {
  lightAccountStaticImplV1_0_1,
  lightAccountStaticImplV1_0_2,
  lightAccountStaticImplV1_1_0,
  lightAccountStaticImplV2_0_0,
  lightAccountStaticImplV2_1_0,
  lightAccountStaticImplV2_2_0,
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
    "v2.1.0": lightAccountStaticImplV2_1_0,
    "v2.2.0": lightAccountStaticImplV2_2_0,
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

/**
 * Light Account v1 versions
 */
export const LightAccountV1Versions = [
  "v1.0.1",
  "v1.0.2",
  "v1.1.0",
] as const satisfies LightAccountVersion<"LightAccount">[];

/**
 * Light Account v2 versions
 */
export const LightAccountV2Versions = [
  "v2.0.0",
  "v2.1.0",
  "v2.2.0",
] as const satisfies LightAccountVersion<"LightAccount">[];

/**
 * Type guard to check if a version is a Light Account v1 version
 *
 * @param {LightAccountVersion<"LightAccount">} version - The version to check.
 * @returns {boolean} True if the version is a v1 version.
 */
export const isLightAccountVersion1 = (
  version: LightAccountVersion<"LightAccount">,
): version is (typeof LightAccountV1Versions)[number] =>
  (LightAccountV1Versions as readonly string[]).includes(version);

/**
 * Type guard to check if a version is a Light Account v2 version
 *
 * @param {LightAccountVersion<"LightAccount">} version - The version to check.
 * @returns {boolean} True if the version is a v2 version.
 */
export const isLightAccountVersion2 = (
  version: LightAccountVersion<"LightAccount">,
): version is (typeof LightAccountV2Versions)[number] =>
  (LightAccountV2Versions as readonly string[]).includes(version);

export type GetLightAccountType<TAccount extends LightAccountBase> =
  TAccount["smartAccountType"] extends LightAccountType
    ? TAccount["smartAccountType"]
    : never;

export type LightAccountAbi<
  TAccountType extends LightAccountType,
  TAccountVersion extends LightAccountVersion<TAccountType>,
> = TAccountVersion extends keyof (typeof AccountVersionRegistry)[TAccountType]
  ? (typeof AccountVersionRegistry)[TAccountType][TAccountVersion] extends StaticSmartAccountImplementation
    ? (typeof AccountVersionRegistry)[TAccountType][TAccountVersion]["accountAbi"]
    : never
  : never;

/**
 * Infers the EntryPoint details as a type, given the account type and version.
 */
export type EntryPointFromAccountRegistry<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
> =
  (typeof AccountVersionRegistry)[TLightAccountType][TLightAccountVersion] extends StaticSmartAccountImplementation<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer _7702,
    infer entryPointVersion,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
