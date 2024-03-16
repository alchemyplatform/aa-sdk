import type {
  EntryPointVersion,
  SendUserOperationParameters,
  SmartContractAccount,
} from "@alchemy/aa-core";
import type { Chain, Client, Transport } from "viem";
import { simulateUserOperationChanges } from "../../actions/simulateUserOperationChanges.js";
import type { SimulateUserOperationAssetChangesResponse } from "../../actions/types.js";

export type AlchemySmartAccountClientActions<
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = {
  simulateUserOperation: (
    args: SendUserOperationParameters<TEntryPointVersion, TAccount>
  ) => Promise<SimulateUserOperationAssetChangesResponse>;
};

export const alchemyActions: <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => AlchemySmartAccountClientActions<TEntryPointVersion, TAccount> = (
  client
) => ({
  simulateUserOperation: async (args) =>
    simulateUserOperationChanges(client, args),
});
