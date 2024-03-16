import type { Chain, Transport } from "viem";
import type {
  GetAccountParameter,
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient";
import { AccountNotFoundError } from "../../../errors/account.js";
import { overridePaymasterDataMiddleware } from "../../../middleware/defaults/overridePaymasterData.js";
import type {
  UserOperationOverrides,
  UserOperationOverridesParameter,
  UserOperationStruct,
} from "../../../types";
import { resolveProperties, type Deferrable } from "../../../utils/index.js";

const asyncPipe =
  <S, Opts>(...fns: ((s: S, opts: Opts) => Promise<S>)[]) =>
  async (s: S, opts: Opts) => {
    let result = s;
    for (const fn of fns) {
      result = await fn(result, opts);
    }
    return result;
  };

export async function _runMiddlewareStack<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: {
    uo: Deferrable<UserOperationStruct<TEntryPointVersion>>;
    context?: TContext;
  } & GetAccountParameter<TAccount> &
    UserOperationOverridesParameter<TEntryPointVersion>
): Promise<UserOperationStruct<TEntryPointVersion>> {
  const { uo, overrides, account = client.account, context } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  const entryPoint = account.getEntryPoint();

  const overridePaymasterData =
    overrides &&
    ((entryPoint.version === "0.6.0" &&
      (overrides as UserOperationOverrides<"0.6.0">).paymasterAndData !=
        null) ||
      (entryPoint.version === "0.7.0" &&
        (overrides as UserOperationOverrides<"0.7.0">).paymasterData != null));

  const result = await asyncPipe(
    client.middleware.dummyPaymasterAndData,
    client.middleware.feeEstimator,
    client.middleware.gasEstimator,
    client.middleware.customMiddleware,
    overridePaymasterData
      ? overridePaymasterDataMiddleware
      : client.middleware.paymasterAndData,
    client.middleware.userOperationSimulator,
    client.middleware.signUserOperation
  )(uo, { overrides, feeOptions: client.feeOptions, account, client, context });

  return resolveProperties(result) as Promise<
    UserOperationStruct<GetEntryPointFromAccount<TAccount>>
  >;
}
