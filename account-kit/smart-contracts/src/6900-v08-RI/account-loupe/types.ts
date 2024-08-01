import type { Address, Hex } from "viem";

/**
 * 26 bytes.
 * Treats the first 20 bytes as an address.
 * The next 4 bytes as a identifier.
 * the next 1 byte is the type (Execution or validation).
 * The last 1 bytes has two flags that indicate if it has pre and/or post hooks
 *
 * Layout:
 * 0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA________________________ // Address
 * 0x________________________________________BBBBBBBB________________ // Entity ID
 * 0x________________________________________________CC______________ // Type
 * 0x__________________________________________________DD____________ // exec hook flags
 */
export type HookConfig = Hex;

// 24 bytes. Treats the first 20 bytes as an address, and the last 4 byte as a identifier.
export type ModuleEntity = Hex;

export type ExecutionData = {
  module: Address;
  isPublic: boolean;
  allowGlobalValidation: boolean;
  executionHooks: HookConfig[];
};

export type ValidationData = {
  isGlobal: boolean;
  isSignatureValidation: boolean;
  preValidationHooks: ModuleEntity[];
  permissionHooks: HookConfig[];
  selectors: Hex[];
};
