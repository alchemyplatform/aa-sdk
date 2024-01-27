import type {
  SendUserOperationParameters,
  SmartContractAccount,
} from "@alchemy/aa-core";
import type { Chain, Transport } from "viem";
import { simulateUserOperationChanges } from "../../actions/simulateUserOperationChanges.js";
import type { SimulateUserOperationAssetChangesResponse } from "../../actions/types.js";
import type { AlchemySmartAccountClient_Base } from "../smartAccount.js";

export type AlchemySmartAccountClientActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  simulateUserOperation: (
    args: SendUserOperationParameters<TAccount>
  ) => Promise<SimulateUserOperationAssetChangesResponse>;
};

export const alchemyActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: AlchemySmartAccountClient_Base<TTransport, TChain, TAccount>
) => AlchemySmartAccountClientActions<TAccount> = (client) => ({
  simulateUserOperation: async (args) =>
    simulateUserOperationChanges(client, args),
});
