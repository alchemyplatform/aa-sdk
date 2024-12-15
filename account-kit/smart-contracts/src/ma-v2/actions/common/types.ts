import type { Address, Hex } from "viem";

export type ModuleEntity = {
  address: Address;
  entityId: number;
};

export type ValidationFlags = {
  isGlobal: boolean;
  isSignatureValidation: boolean;
  isUserOpValidation: boolean;
};

export type ValidationConfig = {
  address: Address;
  entityId: number; // uint8
  validationFlags: ValidationFlags; // uint32
};

export enum HookType {
  EXECUTION = "0x00",
  VALIDATION = "0x01",
}

export type HookConfig = {
  address: Address;
  entityId: number; // uint32
  hookType: HookType;
  hasPreHooks: boolean;
  hasPostHooks: boolean;
};

// maps to type ValidationStorage in MAv2 implementation
export type ValidationData = {
  validationFlags: ValidationFlags;
  validationHooks: HookConfig[];
  executionHooks: Hex[];
  selectors: Hex[];
};
