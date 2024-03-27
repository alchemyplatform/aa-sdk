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

//#region UpgradeAccountParams
export type UpgradeAccountParams<
  TAccount extends SmartContractAccount | undefined,
  TContext extends Record<string, any> = Record<string, any>
> = {
  upgradeTo: UpgradeToData;
  overrides?: UserOperationOverrides;
  waitForTx?: boolean;
  context?: TContext;
} & GetAccountParameter<TAccount>;
//#endregion UpgradeAccountParams

//#region SendUserOperationParameters
export type SendUserOperationParameters<
  TAccount extends SmartContractAccount | undefined,
  TContext extends Record<string, any> = Record<string, any>
> = {
  uo: UserOperationCallData | BatchUserOperationCallData;
  overrides?: UserOperationOverrides;
  context?: TContext;
} & GetAccountParameter<TAccount>;
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
  TContext extends Record<string, any> = Record<string, any>
> = {
  requests: RpcTransactionRequest[];
  overrides?: UserOperationOverrides;
  context?: TContext;
} & GetAccountParameter<TAccount>;
//#endregion SendTransactionsParameters

//#region DropAndReplaceUserOperationParameters
export type DropAndReplaceUserOperationParameters<
  TAccount extends SmartContractAccount | undefined,
  TContext extends Record<string, any> = Record<string, any>
> = {
  uoToDrop: UserOperationRequest;
  overrides?: UserOperationOverrides;
  context?: TContext;
} & GetAccountParameter<TAccount>;
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
