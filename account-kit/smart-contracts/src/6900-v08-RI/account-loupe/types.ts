import type { Hex } from "viem";

// Treats the first 20 bytes as an address, and the last 4 byte as a identifier.
export type ModuleEntity = Hex;

export type ExecutionHooks = {
  hookFunction: ModuleEntity;
  isPreHook: boolean;
  isPostHook: boolean;
};
