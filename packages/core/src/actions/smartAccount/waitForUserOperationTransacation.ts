import type { Chain, Client, Hex, Transport } from "viem";
import { getTransaction } from "viem/actions";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { FailedToFindTransactionError } from "../../errors/transaction.js";
import { Logger } from "../../logger.js";
import type { WaitForUserOperationTxParameters } from "./types.js";

export const waitForUserOperationTransaction: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>(
  client: Client<TTransport, TChain, any>,
  args: WaitForUserOperationTxParameters
) => Promise<Hex> = async (client, args) => {
  const { hash } = args;

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "upgradeAccount"
    );
  }

  for (let i = 0; i < client.txMaxRetries; i++) {
    const txRetryIntervalWithJitterMs =
      client.txRetryIntervalMs * Math.pow(client.txRetryMultiplier, i) +
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
      return getTransaction(client, {
        hash: receipt.receipt.transactionHash,
      }).then((x) => x.hash);
    }
  }

  throw new FailedToFindTransactionError(hash);
};
