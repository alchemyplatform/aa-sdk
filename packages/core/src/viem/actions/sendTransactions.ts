import type { Chain, Hex, Transport } from "viem";
import type { SmartContractAccount } from "../account.js";
import type { BaseSmartAccountClient } from "../client.js";
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
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: SendTransactionsParameters<TAccount>
) => Promise<Hex> = async (client, args) => {
  const { requests, overrides, account = client.account } = args;
  if (!account) {
    throw new Error("No account set on client");
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
    data: batch,
    overrides: _overrides,
    account,
  });

  return waitForUserOperationTransaction(client, { hash });
};
