import type {
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../account/smartContractAccount";
import type { UserOperationContext } from "../actions/smartAccount/types";
import type {
  UserOperationFeeOptions,
  UserOperationOverrides,
  UserOperationStruct,
} from "../types";
import type { Deferrable } from "../utils";
import type { MiddlewareClient } from "./actions";

// [!region ClientMiddlewareFn]
export type ClientMiddlewareFn<
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = <
  TAccount extends SmartContractAccount,
  C extends MiddlewareClient,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  struct: Deferrable<UserOperationStruct<TEntryPointVersion>>,
  args: {
    overrides?: UserOperationOverrides<TEntryPointVersion>;
    context?: TContext;
    feeOptions?: UserOperationFeeOptions;
    account: TAccount;
    client: C;
  }
) => Promise<Deferrable<UserOperationStruct<TEntryPointVersion>>>;
// [!endregion ClientMiddlewareFn]

// [!region ClientMiddleware]
export type ClientMiddleware<
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
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
// [!endregion ClientMiddleware]
