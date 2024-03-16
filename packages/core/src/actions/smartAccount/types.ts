import type { Hex, RpcTransactionRequest } from "viem";
import type {
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
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = {
  upgradeTo: UpgradeToData;
  waitForTx?: boolean;
} & GetAccountParameter<TEntryPointVersion, TAccount> &
  UserOperationOverridesParameter<TEntryPointVersion>;
//#endregion UpgradeAccountParams

//#region SendUserOperationParameters
export type SendUserOperationParameters<
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = {
  uo: UserOperationCallData | BatchUserOperationCallData;
} & GetAccountParameter<TEntryPointVersion, TAccount> &
  UserOperationOverridesParameter<TEntryPointVersion>;
//#endregion SendUserOperationParameters

//#region SignUserOperationParameters
export type SignUserOperationParameters<
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = {
  uoStruct: UserOperationStruct<TEntryPointVersion>;
} & GetAccountParameter<TEntryPointVersion, TAccount>;
//#endregion SignUserOperationParameters

//#region SendTransactionsParameters
export type SendTransactionsParameters<
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = {
  requests: RpcTransactionRequest[];
} & GetAccountParameter<TEntryPointVersion, TAccount> &
  UserOperationOverridesParameter<TEntryPointVersion>;
//#endregion SendTransactionsParameters

//#region DropAndReplaceUserOperationParameters
export type DropAndReplaceUserOperationParameters<
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = {
  uoToDrop: UserOperationRequest<TEntryPointVersion>;
} & GetAccountParameter<TEntryPointVersion, TAccount> &
  UserOperationOverridesParameter<TEntryPointVersion>;
//#endregion DropAndReplaceUserOperationParameters

//#region WaitForUserOperationTxParameters
export type WaitForUserOperationTxParameters = {
  hash: Hex;
};
//#endregion WaitForUserOperationTxParameters

//#region BuildUserOperationFromTransactionsResult
export type BuildUserOperationFromTransactionsResult<
  TEntryPointVersion extends EntryPointVersion
> = {
  uoStruct: UserOperationStruct<TEntryPointVersion>;
  batch: BatchUserOperationCallData;
} & UserOperationOverridesParameter<TEntryPointVersion, true>;
//#endregion BuildUserOperationFromTransactionsResult
