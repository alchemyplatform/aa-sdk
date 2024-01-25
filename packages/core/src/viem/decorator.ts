import type {
  Chain,
  SendTransactionParameters,
  Transport,
  WaitForTransactionReceiptParameters,
} from "viem";
import type { SendUserOperationResult } from "../provider/types";
import type { Hex, UserOperationStruct } from "../types";
import type { SmartContractAccount } from "./account";
import { buildUserOperation } from "./actions/buildUserOperation.js";
import { buildUserOperationFromTx } from "./actions/buildUserOperationFromTx.js";
import { buildUserOperationFromTxs } from "./actions/buildUserOperationFromTxs.js";
import { checkGasSponsorshipEligibility } from "./actions/checkGasSponsorshipEligibility.js";
import { dropAndReplaceUserOperation } from "./actions/dropAndReplaceUserOperation.js";
import { sendTransaction } from "./actions/sendTransaction.js";
import { sendTransactions } from "./actions/sendTransactions.js";
import { sendUserOperation } from "./actions/sendUserOperation.js";
import type {
  BuildUserOperationFromTransactionsResult,
  DropAndReplaceUserOperationParameters,
  SendTransactionsParameters,
  SendUserOperationParameters,
} from "./actions/types";
import { waitForUserOperationTransaction } from "./actions/waitForUserOperationTransacation.js";
import type { BaseSmartAccountClient } from "./client";

export type BaseSmartAccountClientActions<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  buildUserOperation: (
    args: SendUserOperationParameters<TAccount>
  ) => Promise<UserOperationStruct>;
  buildUserOperationFromTx: (
    args: SendTransactionParameters<TChain, TAccount>
  ) => Promise<UserOperationStruct>;
  buildUserOperationFromTxs: (
    args: SendTransactionsParameters<TAccount>
  ) => Promise<BuildUserOperationFromTransactionsResult>;
  checkGasSponsorshipEligibility: (
    args: SendUserOperationParameters<TAccount>
  ) => Promise<boolean>;
  dropAndReplaceUserOperation: (
    args: DropAndReplaceUserOperationParameters<TAccount>
  ) => Promise<SendUserOperationResult>;
  sendTransaction: <TChainOverride extends Chain | undefined>(
    args: SendTransactionParameters<TChain, TAccount, TChainOverride>
  ) => Promise<Hex>;
  sendTransactions: (
    args: SendTransactionsParameters<TAccount>
  ) => Promise<Hex>;
  sendUserOperation: (
    args: SendUserOperationParameters<TAccount>
  ) => Promise<SendUserOperationResult>;
  waitForUserOperationTransaction: (
    args: WaitForTransactionReceiptParameters
  ) => Promise<Hex>;
};

export const smartAccountClientDecorator: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>
) => BaseSmartAccountClientActions<TChain, TAccount> = (client) => ({
  buildUserOperation: (args) => buildUserOperation(client, args),
  buildUserOperationFromTx: (args) => buildUserOperationFromTx(client, args),
  buildUserOperationFromTxs: (args) => buildUserOperationFromTxs(client, args),
  checkGasSponsorshipEligibility: (args) =>
    checkGasSponsorshipEligibility(client, args),
  dropAndReplaceUserOperation: (args) =>
    dropAndReplaceUserOperation(client, args),
  sendTransaction: (args) => sendTransaction(client, args),
  sendTransactions: (args) => sendTransactions(client, args),
  sendUserOperation: (args) => sendUserOperation(client, args),
  waitForUserOperationTransaction: (args) =>
    waitForUserOperationTransaction(client, args),
});
