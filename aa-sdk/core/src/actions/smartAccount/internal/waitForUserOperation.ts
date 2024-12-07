import type { Chain, Client, Hex, Transport } from "viem";
import type {WaitForUserOperationTxParameters} from "../types";
import {isBaseSmartAccountClient} from "../../../client/isSmartAccountClient";
import {IncompatibleClientError} from "../../../errors/client";
import {Logger} from "../../../logger";
import {FailedToFindTransactionError} from "../../../errors/transaction";
import {UserOperationReceipt} from "../../../types";

export async function _waitForUserOperationTransaction<
    TTransport extends Transport = Transport,
    TChain extends Chain | undefined = Chain | undefined
>(
    client: Client<TTransport, TChain, any>,
    args: WaitForUserOperationTxParameters
) : Promise<UserOperationReceipt>  {
    if (!isBaseSmartAccountClient(client)) {
        throw new IncompatibleClientError(
            "BaseSmartAccountClient",
            "waitForUserOperation",
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
                    `[SmartAccountProvider] waitForUserOperation error fetching receipt for ${hash}: ${e}`
                );
            });

        if (receipt) {
            return receipt
        }
    }


};