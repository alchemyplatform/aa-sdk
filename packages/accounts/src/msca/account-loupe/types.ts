import type { Address, Hash, Hex } from "viem";

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

export interface IAccountLoupe {
  /// @notice Gets the validation functions and plugin address for a selector
  /// @dev If the selector is a native function, the plugin address will be the address of the account
  /// @param selector The selector to get the configuration for
  /// @return The configuration for this selector
  getExecutionFunctionConfig(
    selector: FunctionReference
  ): Promise<ExecutionFunctionConfig>;

  /// @notice Gets the pre and post execution hooks for a selector
  /// @param selector The selector to get the hooks for
  /// @return The pre and post execution hooks for this selector
  getExecutionHooks(
    selector: FunctionReference
  ): Promise<ReadonlyArray<ExecutionHooks>>;

  /// @notice Gets the pre user op and runtime validation hooks associated with a selector
  /// @param selector The selector to get the hooks for
  /// @return preUserOpValidationHooks The pre user op validation hooks for this selector
  /// @return preRuntimeValidationHooks The pre runtime validation hooks for this selector
  getPreValidationHooks(selector: Hash): Promise<Readonly<PreValidationHooks>>;

  /// @notice Gets an array of all installed plugins
  /// @return The addresses of all installed plugins
  getInstalledPlugins(): Promise<ReadonlyArray<Address>>;
}
