import type { Chain, Client, Transport } from "viem";
import type {
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import type { SendUserOperationResult } from "../../client/types.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { buildUserOperation } from "./buildUserOperation.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import type {
  SendUserOperationParameters,
  UserOperationContext,
} from "./types.js";

/**
 * Sends a user operation or batch of user operations using the connected account. Before executing, sendUserOperation will run the user operation through the middleware pipeline.
 *
 * @param client the smart account client to use for RPC requests
 * @param args {@link SendUserOperationParameters} containg the UO or batch to send, context, overrides, and account if not hoisted on the client
 * @returns a Promise containing the {@link SendUserOperationResult}
 */
export async function sendUserOperation<
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
  args: SendUserOperationParameters<TAccount, TContext>
): Promise<SendUserOperationResult<TEntryPointVersion>> {
  const { account = client.account, context, overrides } = args;

  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "sendUserOperation",
      client
    );
  }

  const uoStruct = await buildUserOperation(client, {
    uo: args.uo,
    account,
    context,
    overrides,
  });

  return _sendUserOperation(client, {
    account,
    uoStruct,
    context,
    overrides,
  });
}
