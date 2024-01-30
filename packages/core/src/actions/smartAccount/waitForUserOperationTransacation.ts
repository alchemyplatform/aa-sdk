import type { Chain, Hex, Transport } from "viem";
import { getTransaction } from "viem/actions";
import type { BaseSmartAccountClient } from "../../client/smartAccountClient.js";
import { Logger } from "../../logger.js";
import type { WaitForUserOperationTxParameters } from "./types.js";

export const waitForUserOperationTransaction: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain>,
  args: WaitForUserOperationTxParameters
) => Promise<Hex> = async (client, args) => {
  const { hash } = args;

  for (let i = 0; i < client.txMaxRetries; i++) {
    const txRetryIntervalWithJitterMs =
      client.txRetryIntervalMs * Math.pow(client.txRetryMulitplier, i) +
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

  throw new Error("Failed to find transaction for User Operation");
};
