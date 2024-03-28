import type {
  Chain,
  Client,
  Hex,
  SendTransactionParameters,
  Transport,
} from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { TransactionMissingToParamError } from "../../errors/transaction.js";
import type { UserOperationOverrides } from "../../types.js";
import { buildUserOperationFromTx } from "./buildUserOperationFromTx.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import { waitForUserOperationTransaction } from "./waitForUserOperationTransacation.js";

export const sendTransaction: <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
  TContext extends Record<string, any> = Record<string, any>
>(
  client: Client<Transport, TChain, TAccount>,
  args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
  overrides?: UserOperationOverrides,
  context?: TContext
) => Promise<Hex> = async (client, args, overrides, context) => {
  const { account = client.account } = args;
  if (!account || typeof account === "string") {
    throw new AccountNotFoundError();
  }

  if (!args.to) {
    throw new TransactionMissingToParamError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "sendTransaction",
      client
    );
  }

  const uoStruct = await buildUserOperationFromTx(
    client,
    args,
    overrides,
    context
  );
  const { hash } = await _sendUserOperation(client, {
    account: account as SmartContractAccount,
    uoStruct,
  });

  return waitForUserOperationTransaction(client, { hash });
};
