import type { StaticSmartAccountImplementation } from "../types.js";
import {
  semiModularAccount7702StaticImplV1_0_0,
  semiModularAccount7702StaticImplV1_1_0Beta,
  semiModularAccountV2StaticImpl,
} from "./mav2StaticImpl.js";

/**
 * Account version registry for ModularAccountV2, keyed by contract name and
 * then by contract version. The two semi-modular account contracts version
 * independently, so each gets its own version line.
 *
 * Versions that ship in beta are keyed with their pre-release suffix, so the key
 * a caller passes to `toModularAccountV2` states the stability of the delegation
 * it selects. A pre-release entry may carry
 * `PLACEHOLDER_DELEGATION_ADDRESS` while its contract is undeployed, so
 * selecting it delegates to an address with no code. Both its address and its
 * key can change without a major bump — dropping the suffix at GA is a
 * deliberate break for beta callers.
 *
 * Every non-pre-release entry resolves to a deployed address, enforced by a
 * registry test. For a custom deployment, or a beta one before its address
 * lands here, pass `delegationAddress` to `toModularAccountV2`.
 */
export const ModularAccountV2VersionRegistry = {
  SemiModularAccountBytecode: {
    "v1.0.0": semiModularAccountV2StaticImpl,
  },
  SemiModularAccount7702: {
    "v1.0.0": semiModularAccount7702StaticImplV1_0_0,
    "v1.1.0-beta": semiModularAccount7702StaticImplV1_1_0Beta,
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
 * compares on-chain code against the delegation address. A pre-release version
 * is never the default.
 */
export const DEFAULT_SMAV2_7702_VERSION =
  "v1.0.0" as const satisfies SemiModularAccount7702Version;
