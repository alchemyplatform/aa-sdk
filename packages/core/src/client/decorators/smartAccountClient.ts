import {
  type Address,
  type Chain,
  type Client,
  type Hex,
  type SendTransactionParameters,
  type Transport,
  type TypedData,
  type WaitForTransactionReceiptParameters,
} from "viem";
import { sendTransaction } from "viem/actions";
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
import type { EntryPointVersion } from "../../entrypoint/types";
import type {
  UserOperationOverrides,
  UserOperationRequest,
  UserOperationStruct,
} from "../../types";
import type { IsUndefined } from "../../utils";
import type { SendUserOperationResult } from "../types";

//#region SmartAccountClientActions
export type BaseSmartAccountClientActions<
  TEntryPointVersion extends EntryPointVersion,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = {
  buildUserOperation: (
    args: SendUserOperationParameters<TEntryPointVersion, TAccount>
  ) => Promise<UserOperationStruct<TEntryPointVersion>>;
  buildUserOperationFromTx: (
    args: SendTransactionParameters<TChain, TAccount>,
    overrides?: UserOperationOverrides<TEntryPointVersion>
  ) => Promise<UserOperationStruct<TEntryPointVersion>>;
  buildUserOperationFromTxs: (
    args: SendTransactionsParameters<TEntryPointVersion, TAccount>
  ) => Promise<BuildUserOperationFromTransactionsResult<TEntryPointVersion>>;
  checkGasSponsorshipEligibility: (
    args: SendUserOperationParameters<TEntryPointVersion, TAccount>
  ) => Promise<boolean>;
  signUserOperation: (
    args: SignUserOperationParameters<TEntryPointVersion, TAccount>
  ) => Promise<UserOperationRequest<EntryPointVersion>>;
  dropAndReplaceUserOperation: (
    args: DropAndReplaceUserOperationParameters<TEntryPointVersion, TAccount>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
  sendTransaction: <TChainOverride extends Chain | undefined = undefined>(
    args: SendTransactionParameters<TChain, TAccount, TChainOverride>
  ) => Promise<Hex>;
  sendTransactions: (
    args: SendTransactionsParameters<TEntryPointVersion, TAccount>,
    overrides?: UserOperationOverrides<TEntryPointVersion>
  ) => Promise<Hex>;
  sendUserOperation: (
    args: SendUserOperationParameters<TEntryPointVersion, TAccount>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
  waitForUserOperationTransaction: (
    args: WaitForTransactionReceiptParameters
  ) => Promise<Hex>;
  upgradeAccount: (
    args: UpgradeAccountParams<TEntryPointVersion, TAccount>
  ) => Promise<Hex>;
  signMessage: (
    args: SignMessageParameters<TEntryPointVersion, TAccount>
  ) => Promise<Hex>;
  signTypedData: <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    args: SignTypedDataParameters<
      TEntryPointVersion,
      TTypedData,
      TPrimaryType,
      TAccount
    >
  ) => Promise<Hex>;
  signMessageWith6492: (
    args: SignMessageParameters<TEntryPointVersion, TAccount>
  ) => Promise<Hex>;
  signTypedDataWith6492: <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    args: SignTypedDataParameters<
      TEntryPointVersion,
      TTypedData,
      TPrimaryType,
      TAccount
    >
  ) => Promise<Hex>;
} & (IsUndefined<TAccount> extends false
  ? { getAddress: () => Address }
  : {
      getAddress: (
        args: GetAccountParameter<TEntryPointVersion, TAccount>
      ) => Address;
    });
// #endregion SmartAccountClientActions

export const smartAccountClientActions: <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => BaseSmartAccountClientActions<TEntryPointVersion, TChain, TAccount> = (
  client
) => ({
  buildUserOperation: (args) => buildUserOperation(client, args),
  buildUserOperationFromTx: (args, overrides) =>
    buildUserOperationFromTx(client, args, overrides),
  buildUserOperationFromTxs: (args) => buildUserOperationFromTxs(client, args),
  checkGasSponsorshipEligibility: (args) =>
    checkGasSponsorshipEligibility(client, args),
  signUserOperation: (args) => signUserOperation(client, args),
  dropAndReplaceUserOperation: (args) =>
    dropAndReplaceUserOperation(client, args),
  sendTransaction: (args) => sendTransaction(client, args),
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
