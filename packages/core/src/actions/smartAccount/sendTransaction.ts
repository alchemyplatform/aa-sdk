import type { Chain, Hex, SendTransactionParameters, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import type { BaseSmartAccountClient } from "../../client/smartAccountClient.js";
import { buildUserOperationFromTx } from "./buildUserOperationFromTx.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import { waitForUserOperationTransaction } from "./waitForUserOperationTransacation.js";

export const sendTransaction: <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined
>(
  client: BaseSmartAccountClient<Transport, TChain, TAccount>,
  args: SendTransactionParameters<TChain, TAccount, TChainOverride>
) => Promise<Hex> = async (client, args) => {
  const { account = client.account } = args;
  if (!account || typeof account === "string") {
    throw new Error("No account set on client");
  }

  if (!args.to) {
    throw new Error("Transaction is missing `to` address set on request");
  }

  const uoStruct = await buildUserOperationFromTx(client, args);
  const { hash } = await _sendUserOperation(client, {
    account: account as SmartContractAccount,
    uoStruct,
  });

  return waitForUserOperationTransaction(client, { hash });
};
