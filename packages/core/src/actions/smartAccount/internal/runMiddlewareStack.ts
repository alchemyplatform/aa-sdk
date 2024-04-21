import type { Chain, Transport } from "viem";
import type {
  GetAccountParameter,
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient";
import { AccountNotFoundError } from "../../../errors/account.js";
import { bypassPaymasterMiddleware } from "../../../middleware/defaults/bypassPaymasterMiddleware.js";
import type {
  UserOperationOverridesParameter,
  UserOperationStruct,
} from "../../../types";
import {
  bypassPaymasterAndData,
  resolveProperties,
  type Deferrable,
} from "../../../utils/index.js";
import type { UserOperationContext } from "../types";

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
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
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

  const result = await asyncPipe(
    client.middleware.dummyPaymasterAndData,
    client.middleware.feeEstimator,
    client.middleware.gasEstimator,
    client.middleware.customMiddleware,
    overrides && bypassPaymasterAndData(overrides)
      ? bypassPaymasterMiddleware
      : client.middleware.paymasterAndData,
    client.middleware.userOperationSimulator
  )(uo, { overrides, feeOptions: client.feeOptions, account, client, context });

  return resolveProperties<
    UserOperationStruct<GetEntryPointFromAccount<TAccount>>
  >(result);
}
