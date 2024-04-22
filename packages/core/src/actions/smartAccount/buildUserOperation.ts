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
