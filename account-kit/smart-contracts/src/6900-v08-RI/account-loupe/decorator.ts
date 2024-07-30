import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type SmartContractAccount,
} from "@aa-sdk/core";
import type { Address, Hex, Chain, Client, Transport } from "viem";
import { IAccountLoupeV08Abi } from "../abis/IAccountLoupe.js";
import type { ExecutionHooksV08, ModuleEntity } from "./types.js";

export type AccountLoupeV08Actions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  /// @notice Gets the module address for a selector
  /// @dev If the selector is a native function, the module address will be the address of the account
  /// @param selector The selector to get the configuration for
  /// @return The the module address for this selector
  getExecutionFunctionHandler(
    args: { selector: Hex } & GetAccountParameter<TAccount>
  ): Promise<Address>;

  /// @notice Gets an array of execution function using the validation function
  /// @return The array of execution function using the validation function
  getSelectors(
    args: { validationFunction: ModuleEntity } & GetAccountParameter<TAccount>
  ): Promise<ReadonlyArray<Hex>>;

  /// @notice Gets the pre and post execution hooks for a selector
  /// @param selector The selector to get the hooks for
  /// @return The pre and post execution hooks for this selector
  getExecutionHooks(
    args: { selector: Hex } & GetAccountParameter<TAccount>
  ): Promise<ReadonlyArray<ExecutionHooksV08>>;

  /// @notice Gets the pre user op and runtime validation hooks associated with a selector
  /// @param selector The selector to get the hooks for
  /// @return preUserOpValidationHooks The pre user op validation hooks for this selector
  /// @return preRuntimeValidationHooks The pre runtime validation hooks for this selector
  getPermissionHooks(
    args: { validationFunction: ModuleEntity } & GetAccountParameter<TAccount>
  ): Promise<ReadonlyArray<ExecutionHooksV08>>;

  /// @notice Gets the pre user op and runtime validation hooks associated with a selector
  /// @param selector The selector to get the hooks for
  /// @return preUserOpValidationHooks The pre user op validation hooks for this selector
  /// @return preRuntimeValidationHooks The pre runtime validation hooks for this selector
  getPreValidationHooks(
    args: { validationFunction: ModuleEntity } & GetAccountParameter<TAccount>
  ): Promise<ReadonlyArray<ModuleEntity>>;
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
export const accountLoupeV08Actions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => AccountLoupeV08Actions<TAccount> = (client) => ({
  getExecutionFunctionHandler: async ({
    selector,
    account = client.account,
  }) => {
    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "getExecutionFunctionHandler",
        client
      );
    }

    return client.readContract({
      address: account.address,
      abi: IAccountLoupeV08Abi,
      functionName: "getExecutionFunctionHandler",
      args: [selector],
    });
  },

  getSelectors: async ({ validationFunction, account = client.account }) => {
    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "getSelectors",
        client
      );
    }

    return client.readContract({
      address: account.address,
      abi: IAccountLoupeV08Abi,
      functionName: "getSelectors",
      args: [validationFunction],
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
      abi: IAccountLoupeV08Abi,
      functionName: "getExecutionHooks",
      args: [selector],
    });
  },

  getPermissionHooks: async ({
    validationFunction,
    account = client.account,
  }) => {
    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "getPermissionHooks",
        client
      );
    }

    return client.readContract({
      address: account.address,
      abi: IAccountLoupeV08Abi,
      functionName: "getPermissionHooks",
      args: [validationFunction],
    });
  },

  getPreValidationHooks: async ({
    validationFunction,
    account = client.account,
  }) => {
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
      abi: IAccountLoupeV08Abi,
      functionName: "getPreValidationHooks",
      args: [validationFunction],
    });
  },
});
