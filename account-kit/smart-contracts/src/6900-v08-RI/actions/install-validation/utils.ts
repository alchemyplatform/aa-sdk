import { concatHex, toHex, type Hex, type Address } from "viem";

import type { ValidationConfig, HookConfig, ModuleEntity } from "./types";

export function serializeValidationConfig(config: ValidationConfig): Hex {
  return concatHex([
    config.moduleAddress,
    toHex(config.entityId, { size: 4 }),
    config.isGlobal ? "0x01" : "0x00",
    config.isSignatureValidation ? "0x01" : "0x00",
  ]);
}

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

// todo: deserializeHookConfig

export function serializeModuleEntity(moduleEntity: ModuleEntity): Hex {
  const { moduleAddress, entityId } = moduleEntity;

  return concatHex([moduleAddress, toHex(entityId, { size: 4 })]);
}

// todo: deserializeModuleEntity
