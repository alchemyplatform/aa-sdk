import type {
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../account/smartContractAccount";
import type {
  UserOperationFeeOptions,
  UserOperationOverrides,
  UserOperationStruct,
} from "../types";
import type { Deferrable } from "../utils";

//#region ClientMiddlewareFn
export type ClientMiddlewareFn = <TAccount extends SmartContractAccount>(
  struct: Deferrable<UserOperationStruct<GetEntryPointFromAccount<TAccount>>>,
  args: {
    overrides?: UserOperationOverrides<GetEntryPointFromAccount<TAccount>>;
    feeOptions?: UserOperationFeeOptions;
    account: TAccount;
  }
) => Promise<
  Deferrable<UserOperationStruct<GetEntryPointFromAccount<TAccount>>>
>;
//#endregion ClientMiddlewareFn

//#region ClientMiddleware
export type ClientMiddleware = {
  dummyPaymasterAndData: ClientMiddlewareFn;
  feeEstimator: ClientMiddlewareFn;
  gasEstimator: ClientMiddlewareFn;
  customMiddleware: ClientMiddlewareFn;
  paymasterAndData: ClientMiddlewareFn;
  userOperationSimulator: ClientMiddlewareFn;
};
//#endregion ClientMiddleware
