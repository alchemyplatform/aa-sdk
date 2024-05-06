import {
  type Address,
  type Chain,
  type Client,
  type Hex,
  type SendTransactionParameters,
  type Transport,
  type TypedData,
} from "viem";
import type {
  GetAccountParameter,
  GetEntryPointFromAccount,
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
  BuildTransactionParameters,
  BuildUserOperationFromTransactionsResult,
  BuildUserOperationParameters,
  DropAndReplaceUserOperationParameters,
  SendTransactionsParameters,
  SendUserOperationParameters,
  SignUserOperationParameters,
  UpgradeAccountParams,
  UserOperationContext,
  WaitForUserOperationTxParameters,
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
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  buildUserOperation: (
    args: BuildUserOperationParameters<TAccount, TContext>
  ) => Promise<UserOperationStruct<TEntryPointVersion>>;
  buildUserOperationFromTx: (
    args: SendTransactionParameters<TChain, TAccount>,
    overrides?: UserOperationOverrides<TEntryPointVersion>,
    context?: TContext
  ) => Promise<UserOperationStruct<TEntryPointVersion>>;
  buildUserOperationFromTxs: (
    args: BuildTransactionParameters<TAccount, TContext>
  ) => Promise<BuildUserOperationFromTransactionsResult<TEntryPointVersion>>;
  checkGasSponsorshipEligibility: <
    TContext extends UserOperationContext | undefined =
      | UserOperationContext
      | undefined
  >(
    args: SendUserOperationParameters<TAccount, TContext>
  ) => Promise<boolean>;
  signUserOperation: (
    args: SignUserOperationParameters<TAccount, TEntryPointVersion, TContext>
  ) => Promise<UserOperationRequest<TEntryPointVersion>>;
  dropAndReplaceUserOperation: (
    args: DropAndReplaceUserOperationParameters<TAccount, TContext>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
  // TODO: for v4 we should combine override and context into an `opts` parameter
  // which wraps both of these properties so we can use GetContextParameter
  sendTransaction: <TChainOverride extends Chain | undefined = undefined>(
    args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
    overrides?: UserOperationOverrides<TEntryPointVersion>,
    context?: TContext
  ) => Promise<Hex>;
  sendTransactions: (
    args: SendTransactionsParameters<TAccount, TContext>
  ) => Promise<Hex>;
  sendUserOperation: (
    args: SendUserOperationParameters<
      TAccount,
      TContext,
      GetEntryPointFromAccount<TAccount>
    >
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
  waitForUserOperationTransaction: (
    args: WaitForUserOperationTxParameters
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
  ? { getAddress: () => Address }
  : {
      getAddress: (args: GetAccountParameter<TAccount>) => Address;
    });
// #endregion SmartAccountClientActions

export const smartAccountClientActions: <
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
