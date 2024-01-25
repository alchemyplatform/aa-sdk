import type { Chain, Hex, Transport } from "viem";
import { getTransaction } from "viem/public";
import { erc4337ClientActions } from "../../client/create-client.js";
import { Logger } from "../../logger.js";
import type { SmartContractAccount } from "../account.js";
import type { BaseSmartAccountClient } from "../client.js";
import type { WaitForUserOperationTxParameters } from "./types.js";

export const waitForUserOperationTransaction: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: WaitForUserOperationTxParameters
) => Promise<Hex> = async (client, args) => {
  const { hash } = args;
  const { getUserOperationReceipt } = erc4337ClientActions(client);

  for (let i = 0; i < client.txMaxRetries; i++) {
    const txRetryIntervalWithJitterMs =
      client.txRetryIntervalMs * Math.pow(client.txRetryMulitplier, i) +
      Math.random() * 100;

    await new Promise((resolve) =>
      setTimeout(resolve, txRetryIntervalWithJitterMs)
    );

    const receipt = await getUserOperationReceipt(hash as `0x${string}`).catch(
      (e) => {
        Logger.error(
          `[SmartAccountProvider] waitForUserOperationTransaction error fetching receipt for ${hash}: ${e}`
        );
      }
    );

    if (receipt) {
      return getTransaction(client, {
        hash: receipt.receipt.transactionHash,
      }).then((x) => x.hash);
    }
  }

  throw new Error("Failed to find transaction for User Operation");
};
