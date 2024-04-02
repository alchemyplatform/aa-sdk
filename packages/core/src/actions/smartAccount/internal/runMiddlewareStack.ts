import type { Chain, Transport } from "viem";
import type {
  GetAccountParameter,
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient";
import { AccountNotFoundError } from "../../../errors/account.js";
import { MismatchingEntryPointError } from "../../../errors/entrypoint.js";
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
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: {
    uo: Deferrable<UserOperationStruct<GetEntryPointFromAccount<TAccount>>>;
  } & GetAccountParameter<TAccount> &
    UserOperationOverridesParameter<GetEntryPointFromAccount<TAccount>>
): Promise<UserOperationStruct<GetEntryPointFromAccount<TAccount>>> {
  const { uo, overrides, account = client.account } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  const entryPoint = account.getEntryPoint();
  if (!entryPoint.isUserOpVersion(uo)) {
    throw new MismatchingEntryPointError(entryPoint.version, uo);
  }

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
    client.middleware.userOperationSimulator
  )(uo, { overrides, feeOptions: client.feeOptions, account });

  return resolveProperties(result) as Promise<
    UserOperationStruct<GetEntryPointFromAccount<TAccount>>
  >;
}
