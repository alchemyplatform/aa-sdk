import type { SmartContractAccount } from "../account/smartContractAccount";
import type { EntryPointVersion } from "../entrypoint/types";
import type {
  UserOperationFeeOptions,
  UserOperationOverrides,
  UserOperationStruct,
} from "../types";
import type { Deferrable } from "../utils";

//#region ClientMiddlewareFn
export type ClientMiddlewareFn = <
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion>
>(
  struct: Deferrable<UserOperationStruct<TEntryPointVersion>>,
  args: {
    overrides?: UserOperationOverrides<TEntryPointVersion>;
    feeOptions?: UserOperationFeeOptions;
    account: TAccount;
  }
) => Promise<Deferrable<UserOperationStruct<TEntryPointVersion>>>;
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
