import type { Chain, Client, Hex, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { WaitForUserOperationError } from "../../errors/useroperation.js";
import { buildUserOperationFromTxs } from "./buildUserOperationFromTxs.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import type { SendTransactionsParameters, UserOperationContext } from "./types";
import { waitForUserOperationTransaction } from "./waitForUserOperationTransacation.js";

export async function sendTransactions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined = UserOperationContext
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SendTransactionsParameters<TAccount, TContext>
): Promise<Hex> {
  const { requests, overrides, account = client.account, context } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "sendTransactions",
      client
    );
  }

  const { uoStruct } = await buildUserOperationFromTxs(client, {
    requests,
    overrides,
    account,
    context,
  });

  const { hash, request } = await _sendUserOperation(client, {
    account,
    uoStruct,
    context,
    overrides,
  });

  return waitForUserOperationTransaction(client, { hash }).catch((e) => {
    throw new WaitForUserOperationError(request, e);
  });
}
