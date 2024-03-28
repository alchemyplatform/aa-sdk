import type { Chain, Client, Hex, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { buildUserOperationFromTxs } from "./buildUserOperationFromTxs.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import type { SendTransactionsParameters } from "./types";
import { waitForUserOperationTransaction } from "./waitForUserOperationTransacation.js";

export const sendTransactions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends Record<string, any> = Record<string, any>
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SendTransactionsParameters<TAccount, TContext>
) => Promise<Hex> = async (client, args) => {
  const { requests, overrides, account = client.account } = args;
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
  });

  const { hash } = await _sendUserOperation(client, {
    account: account as SmartContractAccount,
    uoStruct,
  });

  return waitForUserOperationTransaction(client, { hash });
};
