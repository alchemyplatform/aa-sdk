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

/**
 * Sends a transaction using the provided client, arguments, optional overrides, and context.
 * This sends a UO and then waits for it to be mined
 *
 * @example
 * ```ts
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * // smart account client is already extended with sendTransaction
 * const client = createSmartAccountClient(...);
 * const result = await client.sendTransaction({
 *  to: "0x...",
 *  data: "0x...", // or "0x",
 *  value: 0n, // optional
 *  account, // only required if the client above is not connected to an account
 * });
 * ```
 *
 * @param {Client<Transport, TChain, TAccount>} client The client to send the transaction through
 * @param {SendTransactionParameters<TChain, TAccount, TChainOverride>} args The parameters required to send the transaction
 * @param {UserOperationOverrides<TEntryPointVersion>} [overrides] Optional overrides for the user operation
 * @param {UserOperationContext} [context] Optional context for the user operation
 * @returns {Promise<Hex>} A promise that resolves to a hex string representing the transaction hash
 */
export async function sendTransaction<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends
    GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
>(
  client: Client<Transport, TChain, TAccount>,
  args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
  overrides?: UserOperationOverrides<TEntryPointVersion>,
  context?: TContext,
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
      client,
    );
  }

  const uoStruct = await buildUserOperationFromTx(
    client,
    args,
    overrides,
    context,
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
