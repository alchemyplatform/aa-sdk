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
  UserOperationOverrides,
  UserOperationRequest,
  UserOperationStruct,
} from "../../types";

//#region UpgradeAccountParams
export type UpgradeAccountParams<
  TAccount extends SmartContractAccount | undefined,
  TEntryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined
> = {
  upgradeTo: UpgradeToData;
  overrides?: UserOperationOverrides<TEntryPointVersion>;
  waitForTx?: boolean;
} & GetAccountParameter<TAccount>;
//#endregion UpgradeAccountParams

//#region SendUserOperationParameters
export type SendUserOperationParameters<
  TAccount extends SmartContractAccount | undefined,
  TEntryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined
> = {
  uo: UserOperationCallData | BatchUserOperationCallData;
  overrides?: UserOperationOverrides<TEntryPointVersion>;
} & GetAccountParameter<TAccount>;
//#endregion SendUserOperationParameters

//#region SignUserOperationParameters
export type SignUserOperationParameters<
  TAccount extends SmartContractAccount | undefined,
  TEntryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined
> = {
  uoStruct: UserOperationStruct<TEntryPointVersion>;
} & GetAccountParameter<TAccount>;
//#endregion SignUserOperationParameters

//#region SendTransactionsParameters
export type SendTransactionsParameters<
  TAccount extends SmartContractAccount | undefined,
  TEntryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined
> = {
  requests: RpcTransactionRequest[];
  overrides?: UserOperationOverrides<TEntryPointVersion>;
} & GetAccountParameter<TAccount>;
//#endregion SendTransactionsParameters

//#region DropAndReplaceUserOperationParameters
export type DropAndReplaceUserOperationParameters<
  TAccount extends SmartContractAccount | undefined,
  TEntryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined
> = {
  uoToDrop: UserOperationRequest<TEntryPointVersion>;
  overrides?: UserOperationOverrides<TEntryPointVersion>;
} & GetAccountParameter<TAccount>;
//#endregion DropAndReplaceUserOperationParameters

//#region WaitForUserOperationTxParameters
export type WaitForUserOperationTxParameters = {
  hash: Hex;
};
//#endregion WaitForUserOperationTxParameters

//#region BuildUserOperationFromTransactionsResult
export type BuildUserOperationFromTransactionsResult<
  TEntryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined
> = {
  uoStruct: UserOperationStruct<TEntryPointVersion>;
  batch: BatchUserOperationCallData;
  overrides: UserOperationOverrides<TEntryPointVersion>;
};
//#endregion BuildUserOperationFromTransactionsResult
