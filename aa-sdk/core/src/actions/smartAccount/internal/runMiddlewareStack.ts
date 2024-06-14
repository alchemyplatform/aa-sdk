import type { Chain, Transport } from "viem";
import type {
  GetAccountParameter,
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient";
import { AccountNotFoundError } from "../../../errors/account.js";
import { noopMiddleware } from "../../../middleware/noopMiddleware.js";
import type { ClientMiddleware } from "../../../middleware/types";
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

/**
 * Utility method for running a sequence of async functions as a pipeline
 *
 * @template S
 * @template Opts
 * @param fns async functions to run in a pipeline sequence
 * @returns a function that runs the async functions in a pipeline sequence
 */
const asyncPipe =
  <S, Opts>(...fns: ((s: S, opts: Opts) => Promise<S>)[]) =>
  async (s: S, opts: Opts) => {
    let result = s;
    for (const fn of fns) {
      result = await fn(result, opts);
    }
    return result;
  };

/**
 * Internal method of {@link SmartAccountClient} running the middleware stack for a user operation
 *
 * @async
 * @template TTransport
 * @template TChain
 * @template TAccount
 * @template TContext the {@link UserOperationContext} passed to the middleware
 * @template TEntryPointVersion
 * @param client the smart account client instance that runs the middleware pipeline with
 * @param args the Deferrable {@link UserOperationStruct} to run the middleware pipeline on
 *
 * @returns the resolved {@link UserOperationStruct} after running the middleware pipeline
 */
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

  const {
    dummyPaymasterAndData,
    paymasterAndData,
  }: Pick<
    ClientMiddleware<TContext>,
    "dummyPaymasterAndData" | "paymasterAndData"
  > = bypassPaymasterAndData(overrides)
    ? {
        dummyPaymasterAndData: async (uo, { overrides }) => {
          return {
            ...uo,
            ...("paymasterAndData" in overrides!
              ? { paymasterAndData: overrides.paymasterAndData }
              : "paymasterData" in overrides! &&
                "paymaster" in overrides &&
                overrides.paymasterData !== "0x"
              ? {
                  paymasterData: overrides.paymasterData,
                  paymaster: overrides.paymaster,
                }
              : // At this point, nothing has run so no fields are set
                // for 0.7 when not using a paymaster, all fields should be undefined
                undefined),
          };
        },
        paymasterAndData: noopMiddleware,
      }
    : {
        dummyPaymasterAndData: client.middleware.dummyPaymasterAndData,
        paymasterAndData: client.middleware.paymasterAndData,
      };

  const result = await asyncPipe(
    dummyPaymasterAndData,
    client.middleware.feeEstimator,
    client.middleware.gasEstimator,
    client.middleware.customMiddleware,
    paymasterAndData,
    client.middleware.userOperationSimulator
  )(uo, { overrides, feeOptions: client.feeOptions, account, client, context });

  return resolveProperties<
    UserOperationStruct<GetEntryPointFromAccount<TAccount>>
  >(result);
}
