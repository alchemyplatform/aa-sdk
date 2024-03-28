import type {
  Address,
  Chain,
  Client,
  Hex,
  SendTransactionParameters,
  Transport,
  TypedData,
  WaitForTransactionReceiptParameters,
} from "viem";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import { buildUserOperation } from "../../actions/smartAccount/buildUserOperation.js";
import { buildUserOperationFromTx } from "../../actions/smartAccount/buildUserOperationFromTx.js";
import { buildUserOperationFromTxs } from "../../actions/smartAccount/buildUserOperationFromTxs.js";
import { checkGasSponsorshipEligibility } from "../../actions/smartAccount/checkGasSponsorshipEligibility.js";
import { dropAndReplaceUserOperation } from "../../actions/smartAccount/dropAndReplaceUserOperation.js";
import { getAddress } from "../../actions/smartAccount/getAddress.js";
import { sendTransaction } from "../../actions/smartAccount/sendTransaction.js";
import { sendTransactions } from "../../actions/smartAccount/sendTransactions.js";
import { sendUserOperation } from "../../actions/smartAccount/sendUserOperation.js";
import {
  signMessage,
  type SignMessageParameters,
} from "../../actions/smartAccount/signMessage.js";
import { signMessageWith6492 } from "../../actions/smartAccount/signMessageWith6492.js";
import {
  signTypedData,
  type SignTypedDataParameters,
} from "../../actions/smartAccount/signTypedData.js";
import { signTypedDataWith6492 } from "../../actions/smartAccount/signTypedDataWith6492.js";
import { signUserOperation } from "../../actions/smartAccount/signUserOperation.js";
import type {
  BuildUserOperationFromTransactionsResult,
  DropAndReplaceUserOperationParameters,
  SendTransactionsParameters,
  SendUserOperationParameters,
  SignUserOperationParameters,
  UpgradeAccountParams,
} from "../../actions/smartAccount/types";
import { upgradeAccount } from "../../actions/smartAccount/upgradeAccount.js";
import { waitForUserOperationTransaction } from "../../actions/smartAccount/waitForUserOperationTransacation.js";
import type {
  UserOperationOverrides,
  UserOperationRequest,
  UserOperationStruct,
} from "../../types";
import type { IsUndefined } from "../../utils";
import type { SendUserOperationResult } from "../types";

//#region SmartAccountClientActions
export type BaseSmartAccountClientActions<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends Record<string, any> = Record<string, any>
> = {
  buildUserOperation: (
    args: SendUserOperationParameters<TAccount, TContext>
  ) => Promise<UserOperationStruct>;
  buildUserOperationFromTx: (
    args: SendTransactionParameters<TChain, TAccount>,
    overrides?: UserOperationOverrides,
    context?: TContext
  ) => Promise<UserOperationStruct>;
  buildUserOperationFromTxs: (
    args: SendTransactionsParameters<TAccount, TContext>
  ) => Promise<BuildUserOperationFromTransactionsResult>;
  checkGasSponsorshipEligibility: <
    TContext extends Record<string, any> = Record<string, any>
  >(
    args: SendUserOperationParameters<TAccount, TContext>
  ) => Promise<boolean>;
  signUserOperation: (
    args: SignUserOperationParameters<TAccount>
  ) => Promise<UserOperationRequest>;
  dropAndReplaceUserOperation: (
    args: DropAndReplaceUserOperationParameters<TAccount, TContext>
  ) => Promise<SendUserOperationResult>;
  sendTransaction: <TChainOverride extends Chain | undefined = undefined>(
    args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
    overrides?: UserOperationOverrides,
    context?: TContext
  ) => Promise<Hex>;
  sendTransactions: (
    args: SendTransactionsParameters<TAccount, TContext>
  ) => Promise<Hex>;
  sendUserOperation: (
    args: SendUserOperationParameters<TAccount, TContext>
  ) => Promise<SendUserOperationResult>;
  waitForUserOperationTransaction: (
    args: WaitForTransactionReceiptParameters
  ) => Promise<Hex>;
  upgradeAccount: (
    args: UpgradeAccountParams<TAccount, TContext>
  ) => Promise<Hex>;
  signMessage: (args: SignMessageParameters<TAccount>) => Promise<Hex>;
  signTypedData: <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    args: SignTypedDataParameters<TTypedData, TPrimaryType, TAccount>
  ) => Promise<Hex>;
  signMessageWith6492: (args: SignMessageParameters<TAccount>) => Promise<Hex>;
  signTypedDataWith6492: <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    args: SignTypedDataParameters<TTypedData, TPrimaryType, TAccount>
  ) => Promise<Hex>;
} & (IsUndefined<TAccount> extends false
  ? {
      getAddress: () => Address;
    }
  : {
      getAddress: (args: GetAccountParameter<TAccount>) => Address;
    });
//#endregion SmartAccountClientActions

export const smartAccountClientActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends Record<string, any> = Record<string, any>
>(
  client: Client<TTransport, TChain, TAccount>
) => BaseSmartAccountClientActions<TChain, TAccount, TContext> = (client) => ({
  buildUserOperation: (args) => buildUserOperation(client, args),
  buildUserOperationFromTx: (args, overrides, context) =>
    buildUserOperationFromTx(client, args, overrides, context),
  buildUserOperationFromTxs: (args) => buildUserOperationFromTxs(client, args),
  checkGasSponsorshipEligibility: (args) =>
    checkGasSponsorshipEligibility(client, args),
  signUserOperation: (args) => signUserOperation(client, args),
  dropAndReplaceUserOperation: (args) =>
    dropAndReplaceUserOperation(client, args),
  sendTransaction: (args, overrides, context) =>
    sendTransaction(client, args, overrides, context),
  sendTransactions: (args) => sendTransactions(client, args),
  sendUserOperation: (args) => sendUserOperation(client, args),
  waitForUserOperationTransaction: (args) =>
    waitForUserOperationTransaction.bind(client)(client, args),
  upgradeAccount: (args) => upgradeAccount(client, args),
  getAddress: (args) => getAddress(client, args),
  signMessage: (args) => signMessage(client, args),
  signTypedData: (args) => signTypedData(client, args),
  signMessageWith6492: (args) => signMessageWith6492(client, args),
  signTypedDataWith6492: (args) => signTypedDataWith6492(client, args),
});

export const smartAccountClientMethodKeys = Object.keys(
  // @ts-expect-error we just want to get the keys
  smartAccountClientActions(undefined)
).reduce((accum, curr) => {
  accum.add(curr);
  return accum;
}, new Set<string>());
