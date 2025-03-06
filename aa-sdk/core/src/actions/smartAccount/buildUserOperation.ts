import type { Chain, Client, Transport } from "viem";
import {
  type GetEntryPointFromAccount,
  type SmartContractAccount,
} from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import type { UserOperationStruct } from "../../types.js";
import { _initUserOperation } from "./internal/initUserOperation.js";
import { _runMiddlewareStack } from "./internal/runMiddlewareStack.js";
import type {
  BuildUserOperationParameters,
  UserOperationContext,
} from "./types";

/**
 * Builds a user operation using the provided client and operation parameters. Ensures that the account exists and the client is compatible.
 *
 * @example
 * ```ts
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * // smart account client is already extended with buildUserOperation
 * const client = createSmartAccountClient(...);
 * const result = await client.buildUserOperation({
 *  uo: {
 *    target: "0x...",
 *    data: "0x...", // or "0x",
 *    value: 0n, // optional
 *  },
 *  account, // only required if the client above is not connected to an account
 * });
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client the client instance used to build the user operation
 * @param {BuildUserOperationParameters<TAccount, TContext, TEntryPointVersion>} args the parameters required to build the user operation, including account, overrides, and context
 * @returns {Promise<UserOperationStruct<TEntryPointVersion>>} a promise that resolves to a `UserOperationStruct` object containing the built user operation details
 */
export async function buildUserOperation<
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
  client: Client<TTransport, TChain, TAccount>,
  args: BuildUserOperationParameters<TAccount, TContext, TEntryPointVersion>
): Promise<UserOperationStruct<TEntryPointVersion>> {
  const { account = client.account, overrides, context } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "buildUserOperation",
      client
    );
  }

  return _initUserOperation(client, args).then((_uo) =>
    _runMiddlewareStack(client, {
      uo: _uo,
      overrides,
      account,
      context,
    })
  );
}
