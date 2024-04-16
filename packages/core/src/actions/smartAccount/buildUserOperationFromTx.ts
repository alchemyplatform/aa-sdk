import {
  type Chain,
  type Client,
  type SendTransactionParameters,
  type Transport,
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
import { buildUserOperation } from "./buildUserOperation.js";
import type { UserOperationContext } from "./types.js";

export async function buildUserOperationFromTx<
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
): Promise<UserOperationStruct<TEntryPointVersion>> {
  const { account = client.account, ...request } = args;
  if (!account || typeof account === "string") {
    throw new AccountNotFoundError();
  }

  if (!request.to) {
    throw new TransactionMissingToParamError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "buildUserOperationFromTx",
      client
    );
  }

  const _overrides = {
    ...overrides,
    maxFeePerGas: request.maxFeePerGas ? request.maxFeePerGas : undefined,
    maxPriorityFeePerGas: request.maxPriorityFeePerGas
      ? request.maxPriorityFeePerGas
      : undefined,
  } as UserOperationOverrides<TEntryPointVersion>;

  return buildUserOperation(client, {
    uo: {
      target: request.to,
      data: request.data ?? "0x",
      value: request.value ? request.value : 0n,
    },
    account: account as SmartContractAccount,
    context,
    overrides: _overrides,
  });
}
