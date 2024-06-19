import type {
  SendUserOperationParameters,
  SmartContractAccount,
  UserOperationContext,
} from "@aa-sdk/core";
import type { Chain, Client, Transport } from "viem";
import { simulateUserOperationChanges } from "../../actions/simulateUserOperationChanges.js";
import type { SimulateUserOperationAssetChangesResponse } from "../../actions/types.js";

export type AlchemySmartAccountClientActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = {
  simulateUserOperation: (
    args: SendUserOperationParameters<TAccount, TContext>
  ) => Promise<SimulateUserOperationAssetChangesResponse>;
};

/**
 * Provides a set of actions for interacting with the Alchemy Smart Account client, including the ability to simulate user operations.
 *
 * @example
 * ```ts
 * import { alchemyActions } from "@account-kit/infra";
 * import { createPublicClient } from "viem";
 *
 * const client = createPublicClient(...);
 * const clientWithAlchemyActions = client.extend(alchemyActions);
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client The client instance used to perform actions
 * @returns {AlchemySmartAccountClientActions<TAccount, TContext>} An object containing Alchemy Smart Account client actions
 */
export const alchemyActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => AlchemySmartAccountClientActions<TAccount, TContext> = (client) => ({
  simulateUserOperation: async (args) =>
    simulateUserOperationChanges(client, args),
});
