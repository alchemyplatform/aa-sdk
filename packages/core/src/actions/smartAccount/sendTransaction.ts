import type {
  Chain,
  Client,
  Hex,
  SendTransactionParameters,
  Transport,
} from "viem";
import type {
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { TransactionMissingToParamError } from "../../errors/transaction.js";
import type {
  UserOperationOverrides,
  UserOperationStruct,
} from "../../types.js";
import { buildUserOperationFromTx } from "./buildUserOperationFromTx.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import { waitForUserOperationTransaction } from "./waitForUserOperationTransacation.js";

export async function sendTransaction<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  client: Client<Transport, TChain, TAccount>,
  args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
  overrides?: UserOperationOverrides<TEntryPointVersion>
): Promise<Hex> {
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

  const uoStruct = await buildUserOperationFromTx(client, args, overrides);
  const { hash } = await _sendUserOperation(client, {
    account: account as SmartContractAccount,
    uoStruct: uoStruct as UserOperationStruct<TEntryPointVersion>,
  });

  return waitForUserOperationTransaction(client, { hash });
}
