import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type SmartContractAccount,
} from "@aa-sdk/core";
import type { Hex, Chain, Client, Transport } from "viem";
import { IAccountLoupeV08Abi } from "../abis/IAccountLoupe.js";
import type { ExecutionData, ModuleEntity, ValidationData } from "./types.js";

export type AccountLoupeV08Actions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  getExecutionData(
    args: { selector: Hex } & GetAccountParameter<TAccount>
  ): Promise<ExecutionData>;

  getValidationData(
    args: { validationFunction: ModuleEntity } & GetAccountParameter<TAccount>
  ): Promise<ValidationData>;
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
 * const client = createSmartAccountClient(...).extend(accountLoupeV08Actions);
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
  getExecutionData: async ({ selector, account = client.account }) => {
    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "getExecutionData",
        client
      );
    }

    const result = await client.readContract({
      address: account.address,
      abi: IAccountLoupeV08Abi,
      functionName: "getExecutionData",
      args: [selector],
    });

    return {
      ...result,
      executionHooks: [...result.executionHooks], // Cast to mutable array
    };
  },

  getValidationData: async ({
    validationFunction,
    account = client.account,
  }) => {
    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "getValidationData",
        client
      );
    }

    const result = await client.readContract({
      address: account.address,
      abi: IAccountLoupeV08Abi,
      functionName: "getValidationData",
      args: [validationFunction],
    });

    return {
      ...result,
      preValidationHooks: [...result.preValidationHooks],
      permissionHooks: [...result.permissionHooks],
      selectors: [...result.selectors],
    };
  },
});
