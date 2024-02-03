import type { Chain, Client, Hex, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { buildUserOperationFromTxs } from "./buildUserOperationFromTxs.js";
import { sendUserOperation } from "./sendUserOperation.js";
import type { SendTransactionsParameters } from "./types";
import { waitForUserOperationTransaction } from "./waitForUserOperationTransacation.js";

export const sendTransactions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SendTransactionsParameters<TAccount>
) => Promise<Hex> = async (client, args) => {
  const { requests, overrides, account = client.account } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "sendTransactions"
    );
  }

  const { batch, overrides: _overrides } = await buildUserOperationFromTxs(
    client,
    {
      requests,
      overrides,
      account,
    }
  );

  const { hash } = await sendUserOperation(client, {
    uo: batch,
    overrides: _overrides,
    account,
  });

  return waitForUserOperationTransaction(client, { hash });
};
