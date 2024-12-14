import { type Hex, toHex, concatHex } from "viem";
import type { ValidationConfig, HookConfig, ModuleEntity } from "./types";

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
  return concatHex([
    config.address,
    toHex(config.entityId, { size: 4 }),
    config.hookType,
    // hasPostHook is stored in the first bit, hasPreHook in the second bit
    toHex((config.hasPostHooks ? 1 : 0) + (config.hasPreHooks ? 2 : 0), {
      size: 1,
    }),
  ]);
}

export function serializeModuleEntity(config: ModuleEntity): Hex {
  return concatHex([config.moduleAddress, toHex(config.entityId, { size: 4 })]);
}
