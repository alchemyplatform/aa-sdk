import type { Hex, RpcTransactionRequest } from "viem";
import type {
  BatchUserOperationCallData,
  UserOperationCallData,
  UserOperationOverrides,
  UserOperationRequest,
} from "../../types";
import type { GetAccountParameter, SmartContractAccount } from "../account";

export type SendUserOperationParameters<
  TAccount extends SmartContractAccount | undefined
> = {
  data: UserOperationCallData | BatchUserOperationCallData;
  overrides?: UserOperationOverrides;
} & GetAccountParameter<TAccount>;

export type SendTransactionsParameters<
  TAccount extends SmartContractAccount | undefined
> = {
  requests: RpcTransactionRequest[];
  overrides?: UserOperationOverrides;
} & GetAccountParameter<TAccount>;

export type DropAndReplaceUserOperationParameters<
  TAccount extends SmartContractAccount | undefined
> = {
  uoToDrop: UserOperationRequest;
  overrides?: UserOperationOverrides;
} & GetAccountParameter<TAccount>;

export type WaitForUserOperationTxParameters = {
  hash: Hex;
};

export type BuildUserOperationFromTransactionsResult = {
  batch: BatchUserOperationCallData;
  overrides: UserOperationOverrides;
};
