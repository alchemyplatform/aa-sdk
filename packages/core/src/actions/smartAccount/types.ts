import type { Hex, RpcTransactionRequest } from "viem";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import type { UpgradeToData } from "../../client/types";
import type {
  BatchUserOperationCallData,
  UserOperationCallData,
  UserOperationOverrides,
  UserOperationRequest,
  UserOperationStruct,
} from "../../types";
import type { IsUndefined } from "../../utils";

//#region UpgradeAccountParams
export type UpgradeAccountParams<
  TAccount extends SmartContractAccount | undefined,
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
> = {
  upgradeTo: UpgradeToData;
  overrides?: UserOperationOverrides;
  waitForTx?: boolean;
} & GetAccountParameter<TAccount> &
  GetContextParameter<TContext>;
//#endregion UpgradeAccountParams

//#region SendUserOperationParameters
export type SendUserOperationParameters<
  TAccount extends SmartContractAccount | undefined,
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
> = {
  uo: UserOperationCallData | BatchUserOperationCallData;
  overrides?: UserOperationOverrides;
} & GetAccountParameter<TAccount> &
  GetContextParameter<TContext>;
//#endregion SendUserOperationParameters

//#region SignUserOperationParameters
export type SignUserOperationParameters<
  TAccount extends SmartContractAccount | undefined
> = {
  uoStruct: UserOperationStruct;
} & GetAccountParameter<TAccount>;
//#endregion SignUserOperationParameters

//#region SendTransactionsParameters
export type SendTransactionsParameters<
  TAccount extends SmartContractAccount | undefined,
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
> = {
  requests: RpcTransactionRequest[];
  overrides?: UserOperationOverrides;
} & GetAccountParameter<TAccount> &
  GetContextParameter<TContext>;
//#endregion SendTransactionsParameters

//#region DropAndReplaceUserOperationParameters
export type DropAndReplaceUserOperationParameters<
  TAccount extends SmartContractAccount | undefined,
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
> = {
  uoToDrop: UserOperationRequest;
  overrides?: UserOperationOverrides;
} & GetAccountParameter<TAccount> &
  GetContextParameter<TContext>;
//#endregion DropAndReplaceUserOperationParameters

//#region WaitForUserOperationTxParameters
export type WaitForUserOperationTxParameters = {
  hash: Hex;
};
//#endregion WaitForUserOperationTxParameters

//#region BuildUserOperationFromTransactionsResult
export type BuildUserOperationFromTransactionsResult = {
  uoStruct: UserOperationStruct;
  batch: BatchUserOperationCallData;
  overrides: UserOperationOverrides;
};
//#endregion BuildUserOperationFromTransactionsResult

export type GetContextParameter<
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
> = IsUndefined<TContext> extends true
  ? {
      context?: TContext;
    }
  : { context: TContext };
