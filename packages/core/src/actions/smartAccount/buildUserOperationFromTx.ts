import {
  type Chain,
  type Client,
  type SendTransactionParameters,
  type Transport,
} from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import type { EntryPointVersion } from "../../entrypoint/types.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { TransactionMissingToParamError } from "../../errors/transaction.js";
import type {
  UserOperationOverrides,
  UserOperationStruct,
} from "../../types.js";
import { filterUndefined } from "../../utils/index.js";
import { buildUserOperation } from "./buildUserOperation.js";

export async function buildUserOperationFromTx<
  TEntryPointVersion extends EntryPointVersion,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined
>(
  client: Client<Transport, TChain, TAccount>,
  args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
  overrides?: UserOperationOverrides<TEntryPointVersion>
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
  };
  filterUndefined(_overrides);

  return buildUserOperation(client, {
    uo: {
      target: request.to,
      data: request.data ?? "0x",
      value: request.value ? request.value : 0n,
    },
    overrides: _overrides as UserOperationOverrides<TEntryPointVersion>,
    account: account as SmartContractAccount<TEntryPointVersion>,
  });
}
