import type { SmartContractAccount } from "../account/smartContractAccount";
import type {
  UserOperationFeeOptions,
  UserOperationOverrides,
  UserOperationStruct,
} from "../types";
import type { Deferrable } from "../utils";
import type { MiddlewareClient } from "./actions";

//#region ClientMiddlewareFn
export type ClientMiddlewareFn = <
  TAccount extends SmartContractAccount,
  C extends MiddlewareClient
>(
  struct: Deferrable<UserOperationStruct>,
  args: {
    overrides?: UserOperationOverrides;
    feeOptions?: UserOperationFeeOptions;
    account: TAccount;
    client: C;
  }
) => Promise<Deferrable<UserOperationStruct>>;
//#endregion ClientMiddlewareFn

//#region ClientMiddleware
export type ClientMiddleware = {
  dummyPaymasterAndData: ClientMiddlewareFn;
  feeEstimator: ClientMiddlewareFn;
  gasEstimator: ClientMiddlewareFn;
  customMiddleware: ClientMiddlewareFn;
  paymasterAndData: ClientMiddlewareFn;
  userOperationSimulator: ClientMiddlewareFn;
  signUserOperation: ClientMiddlewareFn;
};
//#endregion ClientMiddleware
