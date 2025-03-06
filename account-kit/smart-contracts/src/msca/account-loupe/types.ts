import type { Address, Hex } from "viem";

export type FunctionId = Hex;

// Treats the first 20 bytes as an address, and the last byte as a identifier.
export type FunctionReference = Hex;

export type ExecutionFunctionConfig = {
  plugin: Address;
  userOpValidationFunction: FunctionReference;
  runtimeValidationFunction: FunctionReference;
};

export type ExecutionHooks = {
  preExecHook: FunctionReference;
  postExecHook: FunctionReference;
};

export type PreValidationHooks = [
  readonly FunctionReference[],
  readonly FunctionReference[]
];
