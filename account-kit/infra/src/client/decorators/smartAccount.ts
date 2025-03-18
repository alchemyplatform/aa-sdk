import {
  isSmartAccountWithSigner,
  sendTransaction,
  sendTransactions,
  sendUserOperation,
  type GetEntryPointFromAccount,
  type SendTransactionsParameters,
  type SendUserOperationParameters,
  type SendUserOperationResult,
  type SmartContractAccount,
  type UserOperationContext,
  type UserOperationOverrides,
  clientHeaderTrack,
} from "@aa-sdk/core";
import type {
  Chain,
  Client,
  Hex,
  SendTransactionParameters,
  Transport,
} from "viem";
import { simulateUserOperationChanges } from "../../actions/simulateUserOperationChanges.js";
import type { SimulateUserOperationAssetChangesResponse } from "../../actions/types.js";
import { InfraLogger } from "../../metrics.js";

export type AlchemySmartAccountClientActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TChain extends Chain | undefined = Chain | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  simulateUserOperation: (
    args: SendUserOperationParameters<TAccount, TContext>
  ) => Promise<SimulateUserOperationAssetChangesResponse>;
  sendUserOperation: (
    args: SendUserOperationParameters<
      TAccount,
      TContext,
      GetEntryPointFromAccount<TAccount>
    >
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
  sendTransaction: <TChainOverride extends Chain | undefined = undefined>(
    args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
    overrides?: UserOperationOverrides<TEntryPointVersion>,
    context?: TContext
  ) => Promise<Hex>;
  sendTransactions: (
    args: SendTransactionsParameters<TAccount, TContext>
  ) => Promise<Hex>;
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
 * @param {Client<TTransport, TChain, TAccount>} client_ The client instance used to perform actions
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
) => AlchemySmartAccountClientActions<TAccount, TContext, TChain> = (
  client_
) => ({
  simulateUserOperation: async (args) => {
    const client = clientHeaderTrack(client_, "sendUserOperation");
    return simulateUserOperationChanges(client, args);
  },
  sendUserOperation: async (args) => {
    const client = clientHeaderTrack(client_, "sendUserOperation");
    const { account = client.account } = args;

    const result = sendUserOperation(client, args);
    logSendUoEvent(client.chain!.id, account!);
    return result;
  },
  sendTransaction: async (args, overrides, context) => {
    const client = clientHeaderTrack(client_, "sendUserOperation");
    const { account = client.account } = args;

    const result = await sendTransaction(client, args, overrides, context);
    logSendUoEvent(client.chain!.id, account as SmartContractAccount);
    return result;
  },
  async sendTransactions(args) {
    const client = clientHeaderTrack(client_, "sendUserOperation");
    const { account = client.account } = args;

    const result = sendTransactions(client, args);
    logSendUoEvent(client.chain!.id, account!);
    return result;
  },
});

function logSendUoEvent(chainId: number, account: SmartContractAccount) {
  const signerType = isSmartAccountWithSigner(account)
    ? account.getSigner().signerType
    : "unknown";

  InfraLogger.trackEvent({
    name: "client_send_uo",
    data: {
      chainId,
      signerType: signerType,
      entryPoint: account.getEntryPoint().address,
    },
  });
}
