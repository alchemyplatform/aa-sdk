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
} from "../../types";

export type UpgradeAccountParams<
  TAccount extends SmartContractAccount | undefined
> = {
  upgradeTo: UpgradeToData;
  overrides?: UserOperationOverrides;
  waitForTx?: boolean;
} & GetAccountParameter<TAccount>;

export type SendUserOperationParameters<
  TAccount extends SmartContractAccount | undefined
> = {
  uo: UserOperationCallData | BatchUserOperationCallData;
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
