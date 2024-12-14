import type { Address, Hex } from "viem";

export type ModuleEntity = {
  address: Address;
  entityId: number;
};

export type ValidationConfig = {
  address: Address;
  entityId: number; // uint32
  isGlobal: boolean;
  isSignatureValidation: boolean;
  isUserOpValidation: boolean;
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
  isGlobal: boolean; // validation flag
  isSignatureValidation: boolean; // validation flag
  isUserOpValidation: boolean;
  validationHooks: HookConfig[];
  executionHooks: Hex[];
  selectors: Hex[];
};
