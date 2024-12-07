
// TODO: fill in documentation

import type {Client, Chain, Transport} from "viem";
import type {WaitForUserOperationTxParameters} from "./types";
import {UserOperationReceipt} from "../../types";
import {_waitForUserOperationTransaction} from "./internal/waitForUserOperation";
import {FailedToFindTransactionError} from "../../errors/transaction";

export const waitForUserOperationReceipt: <
    TTransport extends Transport = Transport,
    TChain extends Chain | undefined = Chain | undefined
>(
    client: Client<TTransport, TChain, any>,
    args: WaitForUserOperationTxParameters
) => Promise<UserOperationReceipt> = async (client, args) => {

    const receipt =  _waitForUserOperationTransaction(client, args);

    if (receipt) {
        return receipt
    }

    throw new FailedToFindTransactionError(args.hash);
};