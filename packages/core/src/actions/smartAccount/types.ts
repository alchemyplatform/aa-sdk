import type { Hex, RpcTransactionRequest } from "viem";
import type {
  AccountEntryPointVersion,
  GetAccountParameter,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import type { UpgradeToData } from "../../client/types";
import type { EntryPointVersion } from "../../entrypoint/types";
import type {
  BatchUserOperationCallData,
  UserOperationCallData,
  UserOperationOverridesParameter,
  UserOperationRequest,
  UserOperationStruct,
} from "../../types";

//#region UpgradeAccountParams
export type UpgradeAccountParams<
  TAccount extends SmartContractAccount | undefined
> = {
  upgradeTo: UpgradeToData;
  waitForTx?: boolean;
} & GetAccountParameter<TAccount> &
  UserOperationOverridesParameter<AccountEntryPointVersion<TAccount>>;
//#endregion UpgradeAccountParams

//#region SendUserOperationParameters
export type SendUserOperationParameters<
  TAccount extends SmartContractAccount | undefined
> = {
  uo: UserOperationCallData | BatchUserOperationCallData;
} & GetAccountParameter<TAccount> &
  UserOperationOverridesParameter<AccountEntryPointVersion<TAccount>>;
//#endregion SendUserOperationParameters

//#region SignUserOperationParameters
export type SignUserOperationParameters<
  TAccount extends SmartContractAccount | undefined
> = {
  uoStruct: UserOperationStruct<AccountEntryPointVersion<TAccount>>;
} & GetAccountParameter<TAccount>;
//#endregion SignUserOperationParameters

//#region SendTransactionsParameters
export type SendTransactionsParameters<
  TAccount extends SmartContractAccount | undefined
> = {
  requests: RpcTransactionRequest[];
} & GetAccountParameter<TAccount> &
  UserOperationOverridesParameter<AccountEntryPointVersion<TAccount>>;
//#endregion SendTransactionsParameters

//#region DropAndReplaceUserOperationParameters
export type DropAndReplaceUserOperationParameters<
  TAccount extends SmartContractAccount | undefined
> = {
  uoToDrop: UserOperationRequest<AccountEntryPointVersion<TAccount>>;
} & GetAccountParameter<TAccount> &
  UserOperationOverridesParameter<AccountEntryPointVersion<TAccount>>;
//#endregion DropAndReplaceUserOperationParameters

//#region WaitForUserOperationTxParameters
export type WaitForUserOperationTxParameters = {
  hash: Hex;
};
//#endregion WaitForUserOperationTxParameters

//#region BuildUserOperationFromTransactionsResult
export type BuildUserOperationFromTransactionsResult<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = {
  uoStruct: UserOperationStruct<TEntryPointVersion>;
  batch: BatchUserOperationCallData;
} & UserOperationOverridesParameter<TEntryPointVersion, true>;
//#endregion BuildUserOperationFromTransactionsResult
