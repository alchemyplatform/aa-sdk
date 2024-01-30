import {
  type Chain,
  type SendTransactionParameters,
  type Transport,
} from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import type { BaseSmartAccountClient } from "../../client/smartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import type {
  UserOperationOverrides,
  UserOperationStruct,
} from "../../types.js";
import { filterUndefined } from "../../utils/index.js";
import { buildUserOperation } from "./buildUserOperation.js";

export const buildUserOperationFromTx: <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined
>(
  client: BaseSmartAccountClient<Transport, TChain, TAccount>,
  args: SendTransactionParameters<TChain, TAccount, TChainOverride>
) => Promise<UserOperationStruct> = async (client, args) => {
  const { account = client.account, ...request } = args;
  if (!account || typeof account === "string") {
    throw new AccountNotFoundError();
  }

  if (!request.to) {
    throw new Error("Transaction is missing `to` address set on request");
  }

  const _overrides: UserOperationOverrides = {
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
    overrides: _overrides,
    account: account as SmartContractAccount,
  });
};
