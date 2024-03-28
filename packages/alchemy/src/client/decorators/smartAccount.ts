import type {
  SendUserOperationParameters,
  SmartContractAccount,
} from "@alchemy/aa-core";
import type { Chain, Client, Transport } from "viem";
import { simulateUserOperationChanges } from "../../actions/simulateUserOperationChanges.js";
import type { SimulateUserOperationAssetChangesResponse } from "../../actions/types.js";

export type AlchemySmartAccountClientActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
> = {
  simulateUserOperation: (
    args: SendUserOperationParameters<TAccount, TContext>
  ) => Promise<SimulateUserOperationAssetChangesResponse>;
};

export const alchemyActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => AlchemySmartAccountClientActions<TAccount, TContext> = (client) => ({
  simulateUserOperation: async (args) =>
    simulateUserOperationChanges(client, args),
});
