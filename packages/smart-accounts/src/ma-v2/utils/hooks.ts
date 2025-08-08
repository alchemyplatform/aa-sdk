import { concatHex, toHex, type Hex } from "viem";
import { HookType, type HookConfig, type ValidationConfig } from "../types.js";
import { serializeModuleEntity } from "./account.js";

/**
 * Serializes a validation configuration into a hexadecimal string representation. This involves converting boolean flags into bitwise representation and combining them with serialized module entity data.
 *
 * @example
 * ```ts
 * import { serializeValidationConfig } from "@alchemy/smart-contracts";
 * import { Address } from "viem";
 *
 * const moduleAddress: Address = "0x1234";
 * const entityId: number = 1234;
 * const isGlobal: boolean = true;
 * const isSignatureValidation: boolean = false;
 * const isUserOpValidation: boolean = true;
 *
 * const validationConfigHex = serializeValidationConfig({
 *  moduleAddress,
 *  entityId
 *  isGlobal,
 *  isSignatureValidation,
 *  isUserOpValidation
 * });
 * ```
 * @param {ValidationConfig} config The validation configuration object containing details to serialize
 * @returns {Hex} A hexadecimal string representing the serialized configuration
 */
export function serializeValidationConfig(config: ValidationConfig): Hex {
  const isUserOpValidationBit = config.isUserOpValidation ? 1 : 0;
  const isSignatureValidationBit = config.isSignatureValidation ? 2 : 0;
  const isGlobalBit = config.isGlobal ? 4 : 0;
  return concatHex([
    serializeModuleEntity(config),
    toHex(isUserOpValidationBit + isSignatureValidationBit + isGlobalBit, {
      size: 1,
    }),
  ]);
}

/**
 * Serializes a `HookConfig` object into a `Hex` format by encoding the hook type, presence of post/pre hooks, address, and entity ID.
 *
 * @example
 * ```ts
 * import { type HookType, serializeHookConfig } from "@alchemy
 * /smart-contracts";
 * import { Address } from "viem";
 *
 * const moduleAddress: Address = "0x1234";
 * const entityId: number = 1234;
 * const hookType: HookType = HookType.Validation;
 * const hasPostHooks: boolean = false;
 * const hasPreHooks: boolean = true;
 *
 * const hookConfigHex = serializeHookConfig({
 *  moduleAddress,
 *  entityId
 *  hookType,
 *  hasPostHooks,
 *  hasPreHooks
 * });
 * ```
 *
 * @param {HookConfig} config The hook configuration containing address, entity ID, hook type, and post/pre hook indicators
 * @returns {Hex} The serialized hook configuration in hexadecimal format
 */
export function serializeHookConfig(config: HookConfig): Hex {
  const hookTypeBit = config.hookType === HookType.VALIDATION ? 1 : 0;
  const hasPostHooksBit = config.hasPostHooks ? 2 : 0;
  const hasPreHooksBit = config.hasPreHooks ? 4 : 0;
  return concatHex([
    config.address,
    toHex(config.entityId, { size: 4 }),
    toHex(hookTypeBit + hasPostHooksBit + hasPreHooksBit, {
      size: 1,
    }),
  ]);
}
