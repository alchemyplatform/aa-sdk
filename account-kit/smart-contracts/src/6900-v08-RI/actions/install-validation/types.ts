import type { Address } from "viem";

export type ModuleEntity = {
  moduleAddress: Address;
  entityId: number;
};

export type ValidationConfig = {
  moduleAddress: Address;
  entityId: number;
  isGlobal: boolean;
  isSignatureValidation: boolean;
};

export enum HookType {
  EXECUTION = "0x00",
  VALIDATION = "0x01",
}

export type HookConfig = {
  moduleAddress: Address;
  entityId: number;
  hookType: HookType;
  hasPreHooks: boolean;
  hasPostHooks: boolean;
};
