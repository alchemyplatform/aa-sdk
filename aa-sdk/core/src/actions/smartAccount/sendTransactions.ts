import type { Chain, Client, Hex, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { WaitForUserOperationError } from "../../errors/useroperation.js";
import { buildUserOperationFromTxs } from "./buildUserOperationFromTxs.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import type { SendTransactionsParameters, UserOperationContext } from "./types";
import { waitForUserOperationTransaction } from "./waitForUserOperationTransaction.js";
import { clientHeaderTrack } from "../../index.js";

/**
 * Sends transactions using the provided client and transaction parameters. This function builds user operations from the transactions, sends them, and waits for the transaction to be mined.
 *
 * @example
 * ```ts
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * // smart account client is already extended with sendTransactions
 * const client = createSmartAccountClient(...);
 * const result = await client.sendTransactions({
 *  requests: [{
 *    to: "0x...",
 *    data: "0x...", // or "0x",
 *    value: 0n, // optional
 *  }],
 *  account, // only required if the client above is not connected to an account
 * });
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client_ The client used to send the transactions
 * @param {SendTransactionsParameters<TAccount, TContext>} args The parameters for sending the transactions, including requests, overrides, account, and context
 * @returns {Promise<Hex>} A promise that resolves to the transaction hash of the sent transactions
 */
export async function sendTransactions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined = UserOperationContext,
>(
  client_: Client<TTransport, TChain, TAccount>,
  args: SendTransactionsParameters<TAccount, TContext>,
): Promise<Hex> {
  const client = clientHeaderTrack(client_, "estimateUserOperationGas");
  const { requests, overrides, account = client.account, context } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "sendTransactions",
      client,
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
