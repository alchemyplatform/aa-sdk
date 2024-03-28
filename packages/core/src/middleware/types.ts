import type { SmartContractAccount } from "../account/smartContractAccount";
import type {
  UserOperationFeeOptions,
  UserOperationOverrides,
  UserOperationStruct,
} from "../types";
import type { Deferrable } from "../utils";
import type { MiddlewareClient } from "./actions";

//#region ClientMiddlewareFn
export type ClientMiddlewareFn<
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
> = <TAccount extends SmartContractAccount, C extends MiddlewareClient>(
  struct: Deferrable<UserOperationStruct>,
  args: {
    overrides?: UserOperationOverrides;
    context?: TContext;
    feeOptions?: UserOperationFeeOptions;
    account: TAccount;
    client: C;
  }
) => Promise<Deferrable<UserOperationStruct>>;
//#endregion ClientMiddlewareFn

//#region ClientMiddleware
export type ClientMiddleware<
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
> = {
  dummyPaymasterAndData: ClientMiddlewareFn<TContext>;
  feeEstimator: ClientMiddlewareFn<TContext>;
  gasEstimator: ClientMiddlewareFn<TContext>;
  customMiddleware: ClientMiddlewareFn<TContext>;
  paymasterAndData: ClientMiddlewareFn<TContext>;
  userOperationSimulator: ClientMiddlewareFn<TContext>;
  signUserOperation: ClientMiddlewareFn<TContext>;
};
//#endregion ClientMiddleware
