import type { Chain, Transport } from "viem";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient";
import type { EntryPointVersion } from "../../../entrypoint/types";
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

export const _runMiddlewareStack: <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: BaseSmartAccountClient<
    TEntryPointVersion,
    TTransport,
    TChain,
    TAccount
  >,
  args: {
    uo: Deferrable<UserOperationStruct<TEntryPointVersion>>;
  } & GetAccountParameter<TEntryPointVersion, TAccount> &
    UserOperationOverridesParameter<TEntryPointVersion>
) => Promise<UserOperationStruct<TEntryPointVersion>> = async (
  client,
  args
) => {
  const { uo, overrides, account = client.account } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  const entryPoint = account.getEntryPoint();
  if (entryPoint.isUserOpVersion(uo)) {
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

  return resolveProperties(result);
};
