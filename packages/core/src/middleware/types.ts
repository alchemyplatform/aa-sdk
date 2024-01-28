import type { SmartContractAccount } from "../account/smartContractAccount";
import type {
  UserOperationFeeOptions,
  UserOperationOverrides,
  UserOperationStruct,
} from "../types";
import type { Deferrable } from "../utils";

export type ClientMiddlewareFn = <TAccount extends SmartContractAccount>(
  struct: Deferrable<UserOperationStruct>,
  args: {
    overrides?: UserOperationOverrides;
    feeOptions?: UserOperationFeeOptions;
    account: TAccount;
  }
) => Promise<Deferrable<UserOperationStruct>>;

export type ClientMiddleware = {
  dummyPaymasterAndData: ClientMiddlewareFn;
  feeEstimator: ClientMiddlewareFn;
  gasEstimator: ClientMiddlewareFn;
  customMiddleware: ClientMiddlewareFn;
  paymasterAndData: ClientMiddlewareFn;
  userOperationSimulator: ClientMiddlewareFn;
};
