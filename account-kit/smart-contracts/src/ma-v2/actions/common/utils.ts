import { type Hex, toHex, concatHex } from "viem";
import type { ValidationConfig, HookConfig, ModuleEntity } from "./types";
import { HookType } from "./types.js";

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

export function serializeModuleEntity(config: ModuleEntity): Hex {
  return concatHex([config.moduleAddress, toHex(config.entityId, { size: 4 })]);
}
