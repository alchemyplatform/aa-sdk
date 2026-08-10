import type { StaticSmartAccountImplementation } from "../types.js";
import {
  semiModularAccount7702StaticImplV1_0_0,
  semiModularAccount7702StaticImplV1_1_0,
  semiModularAccountV2StaticImpl,
} from "./mav2StaticImpl.js";

/**
 * Account version registry for ModularAccountV2, keyed by contract name and
 * version.
 */
export const ModularAccountV2VersionRegistry = {
  SemiModularAccountBytecode: {
    "v1.0.0": semiModularAccountV2StaticImpl,
  },
  SemiModularAccount7702: {
    "v1.0.0": semiModularAccount7702StaticImplV1_0_0,
    "v1.1.0": semiModularAccount7702StaticImplV1_1_0,
  },
} satisfies Record<string, Record<string, StaticSmartAccountImplementation>>;

export type ModularAccountV2Type = keyof typeof ModularAccountV2VersionRegistry;

export type ModularAccountV2Version<TAccountType extends ModularAccountV2Type> =
  keyof (typeof ModularAccountV2VersionRegistry)[TAccountType];

export type SemiModularAccount7702Version =
  ModularAccountV2Version<"SemiModularAccount7702">;

/**
 * The SemiModularAccount7702 version `toModularAccountV2` delegates to when no
 * `version` is given. Newer versions are opt-in rather than default: moving
 * this would re-delegate every existing 7702 account, since `is7702Delegated`
 * compares on-chain code against the delegation address.
 */
export const DEFAULT_SMAV2_7702_VERSION =
  "v1.0.0" as const satisfies SemiModularAccount7702Version;
