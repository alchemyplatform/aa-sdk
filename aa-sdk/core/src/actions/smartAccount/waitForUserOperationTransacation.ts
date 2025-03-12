import type { Chain, Client, Hex, Transport } from "viem";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { FailedToFindTransactionError } from "../../errors/transaction.js";
import { Logger } from "../../logger.js";
import type { WaitForUserOperationTxParameters } from "./types.js";
import { clientHeaderTrack } from "../../index.js";

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
 * @param {Client<TTransport, TChain, any>} client_ The client instance used to interact with the blockchain
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
) => Promise<Hex> = async (client_, args) => {
  const client = clientHeaderTrack(client_, "waitForUserOperationTransaction");
  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "waitForUserOperationTransaction",
      client
    );
  }

  const {
    hash,
    retries = {
      maxRetries: client.txMaxRetries,
      intervalMs: client.txRetryIntervalMs,
      multiplier: client.txRetryMultiplier,
    },
  } = args;

  for (let i = 0; i < retries.maxRetries; i++) {
    const txRetryIntervalWithJitterMs =
      retries.intervalMs * Math.pow(retries.multiplier, i) +
      Math.random() * 100;

    await new Promise((resolve) =>
      setTimeout(resolve, txRetryIntervalWithJitterMs)
    );

    const receipt = await client
      .getUserOperationReceipt(hash as `0x${string}`)
      .catch((e) => {
        Logger.error(
          `[SmartAccountProvider] waitForUserOperationTransaction error fetching receipt for ${hash}: ${e}`
        );
      });

    if (receipt) {
      return receipt?.receipt.transactionHash;
    }
  }

  throw new FailedToFindTransactionError(hash);
};
