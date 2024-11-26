import type { Chain, Client, Hex, Transport } from "viem";
import { getTransaction } from "viem/actions";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { FailedToFindTransactionError } from "../../errors/transaction.js";
import { Logger } from "../../logger.js";
import type { WaitForUserOperationTxParameters } from "./types.js";
import {_waitForUserOperationTransaction} from "./internal/waitForUserOperation";

/**
 * Waits for a user operation transaction to be confirmed by checking the receipt periodically until it is found or a maximum number of retries is reached.
 *
 * @example
 * ```ts
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * // smart account client is already extended with waitForUserOperationTransaction
 * const client = createSmartAccountClient(...);
 * const result = await client.waitForUserOperationTransaction({
 *  hash: "0x...",
 *  retries: {...} // optional param to configure the retry amounts
 * });
 * ```
 *
 * @param {Client<TTransport, TChain, any>} client The client instance used to interact with the blockchain
 * @param {WaitForUserOperationTxParameters} args The parameters for the transaction to wait for
 * @param {Hex} args.hash The transaction hash to wait for
 * @param {WaitForUserOperationTxParameters["retries"]} [args.retries] Optional retry parameters
 * @param {number} [args.retries.maxRetries] The maximum number of retry attempts
 * @param {number} [args.retries.intervalMs] The interval in milliseconds between retries
 * @param {number} [args.retries.multiplier] The multiplier for the interval between retries
 * @returns {Promise<Hex>} A promise that resolves to the transaction hash when the transaction is confirmed
 */
export const waitForUserOperationTransaction: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>(
  client: Client<TTransport, TChain, any>,
  args: WaitForUserOperationTxParameters
) => Promise<Hex> = async (client, args) => {

  const receipt =  _waitForUserOperationTransaction(client, args);
  if (receipt) {
    return getTransaction(client, {
      hash: (await receipt).receipt.transactionHash,
    }).then((x) => x.hash);
  }

  throw new FailedToFindTransactionError(args.hash);
};
