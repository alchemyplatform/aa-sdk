import type {
  GetAccountParameter,
  SmartAccountClient,
  SmartContractAccount,
} from "@alchemy/aa-core";
import type { Address, Chain, Hash, Transport } from "viem";
import { IAccountLoupeAbi } from "../abis/IAccountLoupe.js";
import type {
  ExecutionFunctionConfig,
  ExecutionHooks,
  FunctionReference,
  PreValidationHooks,
} from "./types.js";

export type AccountLoupeActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  /// @notice Gets the validation functions and plugin address for a selector
  /// @dev If the selector is a native function, the plugin address will be the address of the account
  /// @param selector The selector to get the configuration for
  /// @return The configuration for this selector
  getExecutionFunctionConfig(
    args: { selector: FunctionReference } & GetAccountParameter<TAccount>
  ): Promise<ExecutionFunctionConfig>;

  /// @notice Gets the pre and post execution hooks for a selector
  /// @param selector The selector to get the hooks for
  /// @return The pre and post execution hooks for this selector
  getExecutionHooks(
    args: {
      selector: FunctionReference;
    } & GetAccountParameter<TAccount>
  ): Promise<ReadonlyArray<ExecutionHooks>>;

  /// @notice Gets the pre user op and runtime validation hooks associated with a selector
  /// @param selector The selector to get the hooks for
  /// @return preUserOpValidationHooks The pre user op validation hooks for this selector
  /// @return preRuntimeValidationHooks The pre runtime validation hooks for this selector
  getPreValidationHooks(
    args: { selector: Hash } & GetAccountParameter<TAccount>
  ): Promise<Readonly<PreValidationHooks>>;

  /// @notice Gets an array of all installed plugins
  /// @return The addresses of all installed plugins
  getInstalledPlugins(
    args: GetAccountParameter<TAccount>
  ): Promise<ReadonlyArray<Address>>;
};

export const accountLoupeActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>
) => AccountLoupeActions<TAccount> = (client) => ({
  getExecutionFunctionConfig: async ({
    selector,
    account = client.account,
  }) => {
    if (!account) {
      throw new Error("Account is required");
    }

    return client.readContract({
      address: account.address,
      abi: IAccountLoupeAbi,
      functionName: "getExecutionFunctionConfig",
      args: [selector],
    });
  },

  getExecutionHooks: async ({ selector, account = client.account }) => {
    if (!account) {
      throw new Error("Account is required");
    }

    return client.readContract({
      address: account.address,
      abi: IAccountLoupeAbi,
      functionName: "getExecutionHooks",
      args: [selector],
    });
  },

  getPreValidationHooks: async ({ selector, account = client.account }) => {
    if (!account) {
      throw new Error("Account is required");
    }
    return client.readContract({
      address: account.address,
      abi: IAccountLoupeAbi,
      functionName: "getPreValidationHooks",
      args: [selector],
    });
  },

  getInstalledPlugins: async ({ account = client.account }) => {
    if (!account) {
      throw new Error("Account is required");
    }

    return client.readContract({
      address: account.address,
      abi: IAccountLoupeAbi,
      functionName: "getInstalledPlugins",
    });
  },
});
