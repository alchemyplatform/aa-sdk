import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type SmartContractAccount,
} from "@aa-sdk/core";
import type { Address, Chain, Client, Hash, Transport } from "viem";
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

/**
 * Provides a set of actions for account loupe operations using the specified client.
 * NOTE: this is already added to the client when using any of the Modular Account Clients.
 *
 * @example
 * ```ts
 * import { accountLoupeActions } from "@account-kit/smart-contracts";
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * const client = createSmartAccountClient(...).extend(accountLoupeActions);
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client the client to be used for executing the account loupe actions
 * @returns {AccountLoupeActions<TAccount>} an object containing account loupe actions like `getExecutionFunctionConfig`, `getExecutionHooks`, `getPreValidationHooks`, and `getInstalledPlugins`
 */
export const accountLoupeActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => AccountLoupeActions<TAccount> = (client) => ({
  getExecutionFunctionConfig: async ({
    selector,
    account = client.account,
  }) => {
    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "getExecutionFunctionConfig",
        client
      );
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
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "getExecutionHooks",
        client
      );
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
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "getPreValidationHooks",
        client
      );
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
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "getInstalledPlugins",
        client
      );
    }

    return client
      .readContract({
        address: account.address,
        abi: IAccountLoupeAbi,
        functionName: "getInstalledPlugins",
      })
      .catch(() => []);
  },
});
