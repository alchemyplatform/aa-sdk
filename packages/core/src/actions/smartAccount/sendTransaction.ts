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
import { WaitForUserOperationError } from "../../errors/useroperation.js";
import type { UserOperationOverrides } from "../../types.js";
import { buildUserOperationFromTx } from "./buildUserOperationFromTx.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import type { UserOperationContext } from "./types.js";
import { waitForUserOperationTransaction } from "./waitForUserOperationTransacation.js";

export async function sendTransaction<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  client: Client<Transport, TChain, TAccount>,
  args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
  overrides?: UserOperationOverrides<TEntryPointVersion>,
  context?: TContext
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

  const uoStruct = await buildUserOperationFromTx(
    client,
    args,
    overrides,
    context
  );

  const { hash, request } = await _sendUserOperation(client, {
    account: account as SmartContractAccount,
    uoStruct,
    context,
    overrides,
  });

  return waitForUserOperationTransaction(client, { hash }).catch((e) => {
    throw new WaitForUserOperationError(request, e);
  });
}
