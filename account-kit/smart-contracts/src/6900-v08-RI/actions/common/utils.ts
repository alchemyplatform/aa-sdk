import { concatHex, toHex, type Hex, type Address } from "viem";

import {
  HookType,
  type ValidationConfig,
  type HookConfig,
  type ModuleEntity,
} from "./types.js";

// Validation config is a packed representation of a validation function and flags for its configuration.
//
// Layout:
// 0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA________________________ // Address
// 0x________________________________________BBBBBBBB________________ // Entity ID
// 0x________________________________________________CC______________ // isGlobal
// 0x__________________________________________________DD____________ // isSignatureValidation
// 0x____________________________________________________000000000000 // unused

/**
 * Serializes a `ValidationConfig` object into a 26-byte hex string.
 *
 * @example
 * ```ts
 *
 * const config = serializeValidationConfig({
 *  moduleAddress: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
 *  entityId: 1234,
 *  isGlobal: true,
 *  isSignatureValidation: true,
 * });
 *
 * ```
 *
 * @param {ValidationConfig} config The validation configuration to serialize
 * @returns {Hex} A 26-byte hex string representation of the validation configuration
 */
export function serializeValidationConfig(config: ValidationConfig): Hex {
  return concatHex([
    config.moduleAddress,
    toHex(config.entityId, { size: 4 }),
    config.isGlobal ? "0x01" : "0x00",
    config.isSignatureValidation ? "0x01" : "0x00",
  ]);
}

/**
 * Deserializes a validation configuration hex string into a `ValidationConfig` object.
 *
 * @example
 *
 * ```ts
 *
 * const config = deserializeValidationConfig("0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA000004D201");
 *
 * ```
 *
 * @param {Hex} hex The 26-byte hex string representation of the validation configuration
 * @returns {ValidationConfig} An object containing the module address, entity ID, global status, and signature validation status
 */
export function deserializeValidationConfig(hex: Hex): ValidationConfig {
  // Validation config must be a 26-byte hex string, prefixed with `0x`.
  if (hex.length !== 54 || !hex.startsWith("0x")) {
    throw new Error("Invalid validation config hex length");
  }

  const moduleAddress = hex.slice(0, 42) as Address;
  const entityId = hex.slice(42, 50);
  const isGlobal = hex.slice(50, 52) === "01";
  const isSignatureValidation = hex.slice(52, 54) === "01";

  return {
    moduleAddress,
    entityId: parseInt(entityId, 16),
    isGlobal,
    isSignatureValidation,
  };
}

// HookConfig is 26 bytes.
// Treats the first 20 bytes as an address.
// The next 4 bytes as a identifier.
// the next 1 byte is the type (Execution or validation).
// The last 1 bytes has two flags that indicate if it has pre and/or post hooks
// Layout:
// 0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA________________________ // Address
// 0x________________________________________BBBBBBBB________________ // Entity ID
// 0x________________________________________________CC______________ // Type
// 0x__________________________________________________DD____________ // exec hook flags
// 0x____________________________________________________000000000000 // Unused

/**
 * Serializes a `HookConfig` object into a 26-byte hex string.
 *
 * @example
 *
 * ```ts
 *
 * const config = serializeHookConfig({
 *  moduleAddress: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
 *  entityId: 1234,
 *  hookType: HookType.EXECUTION,
 *  hasPreHooks: true,
 *  hasPostHooks: false,
 * });
 *
 * ```
 *
 * @param {HookConfig} config The hook configuration to serialize
 * @returns {Hex} A 26-byte hex string representation of the hook configuration
 * @throws {Error} If the provided hook configuration is invalid
 */
export function serializeHookConfig(config: HookConfig): Hex {
  return concatHex([
    config.moduleAddress,
    toHex(config.entityId, { size: 4 }),
    config.hookType,
    // hasPostHook is stored in the first bit, hasPreHook in the second bit
    toHex((config.hasPostHooks ? 1 : 0) + (config.hasPreHooks ? 2 : 0), {
      size: 1,
    }),
  ]);
}

/**
 * Deserializes a given hex string into a HookConfig object.
 * The hex string must be a 26-byte hex string, prefixed with `0x`.
 *
 * @example
 *
 * ```ts
 *
 * const config = deserializeHookConfig("0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA000004D20001");
 *
 * ```
 *
 * @param {Hex} hex A 26-byte hex string representing the hook configuration, prefixed with `0x`
 * @returns {HookConfig} An object representing the deserialized hook configuration
 * @throws {Error} If the provided hex string has an invalid length or does not start with `0x`
 */

export function deserializeHookConfig(hex: Hex): HookConfig {
  // Hook config must be a 26-byte hex string, prefixed with `0x`.
  if (hex.length !== 54 || !hex.startsWith("0x")) {
    throw new Error("Invalid hook config hex length");
  }

  const moduleAddress = hex.slice(0, 42) as Address;
  const entityId = hex.slice(42, 50);
  const hookType =
    hex.slice(50, 52) === "00" ? HookType.EXECUTION : HookType.VALIDATION;
  const flags = parseInt(hex.slice(52, 54), 16);

  return {
    moduleAddress,
    entityId: parseInt(entityId, 16),
    hookType,
    hasPostHooks: (flags & 1) !== 0,
    hasPreHooks: (flags & 2) !== 0,
  };
}

// ModuleEntity is 24 bytes.
// Treats the first 20 bytes as an address.
// The next 4 bytes as a identifier.
// Layout:
// 0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA________________________ // Address
// 0x________________________________________BBBBBBBB________________ // Entity ID
// 0x________________________________________________0000000000000000 // Unused

/**
 * Serializes a `ModuleEntity` object into a 24-byte hex string.
 *
 * @example
 *
 * ```ts
 *
 * const entity = serializeModuleEntity({
 *  moduleAddress: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
 *  entityId: 1234,
 * });
 *
 * ```
 *
 * @param {ModuleEntity} moduleEntity The module entity to serialize
 * @returns {Hex} A 24-byte hex string representation of the module entity
 */

export function serializeModuleEntity(moduleEntity: ModuleEntity): Hex {
  const { moduleAddress, entityId } = moduleEntity;

  return concatHex([moduleAddress, toHex(entityId, { size: 4 })]);
}

/**
 * Deserializes a hexadecimal string into a `ModuleEntity` object containing a module address and an entity ID.
 *
 * @example
 *
 * ```ts
 *
 * const entity = deserializeModuleEntity("0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA000004D2");
 *
 * ```
 *
 * @param {Hex} hex The 24-byte hexadecimal string, prefixed with `0x`, representing the module entity
 * @returns {ModuleEntity} An object containing the module address and entity ID
 * @throws {Error} Throws an error if the hex string is not 24 bytes long or does not start with `0x`
 */
export function deserializeModuleEntity(hex: Hex): ModuleEntity {
  // Module entity must be a 24-byte hex string, prefixed with `0x`.
  if (hex.length !== 50 || !hex.startsWith("0x")) {
    throw new Error("Invalid module entity hex length");
  }

  const moduleAddress = hex.slice(0, 42) as Address;
  const entityId = hex.slice(42, 50);

  return {
    moduleAddress,
    entityId: parseInt(entityId, 16),
  };
}
