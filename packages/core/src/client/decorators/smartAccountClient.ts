import type {
  Chain,
  Hex,
  SendTransactionParameters,
  Transport,
  WaitForTransactionReceiptParameters,
} from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount";
import { buildUserOperation } from "../../actions/smartAccount/buildUserOperation.js";
import { buildUserOperationFromTx } from "../../actions/smartAccount/buildUserOperationFromTx.js";
import { buildUserOperationFromTxs } from "../../actions/smartAccount/buildUserOperationFromTxs.js";
import { checkGasSponsorshipEligibility } from "../../actions/smartAccount/checkGasSponsorshipEligibility.js";
import { dropAndReplaceUserOperation } from "../../actions/smartAccount/dropAndReplaceUserOperation.js";
import { sendTransaction } from "../../actions/smartAccount/sendTransaction.js";
import { sendTransactions } from "../../actions/smartAccount/sendTransactions.js";
import { sendUserOperation } from "../../actions/smartAccount/sendUserOperation.js";
import type {
  BuildUserOperationFromTransactionsResult,
  DropAndReplaceUserOperationParameters,
  SendTransactionsParameters,
  SendUserOperationParameters,
  UpgradeAccountParams,
} from "../../actions/smartAccount/types";
import { upgradeAccount } from "../../actions/smartAccount/upgradeAccount.js";
import { waitForUserOperationTransaction } from "../../actions/smartAccount/waitForUserOperationTransacation.js";
import type { UserOperationStruct } from "../../types";
import type { BaseSmartAccountClient } from "../smartAccountClient";
import type { SendUserOperationResult } from "../types";

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
  upgradeAccount: (args: UpgradeAccountParams<TAccount>) => Promise<Hex>;
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
    waitForUserOperationTransaction.bind(client)(client, args),
  upgradeAccount: (args) => upgradeAccount(client, args),
});
