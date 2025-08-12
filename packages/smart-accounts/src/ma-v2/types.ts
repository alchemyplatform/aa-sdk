import type { Address, Hex } from "viem";

export const SignaturePrefix = {
  EOA: "0x00",
  CONTRACT: "0x01",
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type SignaturePrefix =
  (typeof SignaturePrefix)[keyof typeof SignaturePrefix];

export type SignerEntity = {
  isGlobalValidation: boolean;
  entityId: number;
};

export type ExecutionDataView = {
  module: Address;
  skipRuntimeValidation: boolean;
  allowGlobalValidation: boolean;
  executionHooks: readonly Hex[];
};

export type ValidationDataView = {
  validationHooks: readonly Hex[];
  executionHooks: readonly Hex[];
  selectors: readonly Hex[];
  validationFlags: number;
};

export type ModuleEntity = {
  moduleAddress: Address;
  entityId: number;
};

export type ValidationConfig = {
  moduleAddress: Address;
  entityId: number; // uint32
  isGlobal: boolean;
  isSignatureValidation: boolean;
  isUserOpValidation: boolean;
};

export const HookType = {
  EXECUTION: "0x00",
  VALIDATION: "0x01",
} as const;

export type HookType = (typeof HookType)[keyof typeof HookType];

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

export type UpgradeToData = {
  implAddress: Address;
  initializationData: Hex;
};
