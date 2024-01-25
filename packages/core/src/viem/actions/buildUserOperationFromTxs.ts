import { fromHex, type Chain, type Transport } from "viem";
import type { UserOperationOverrides } from "../../types";
import { bigIntMax, filterUndefined } from "../../utils/index.js";
import type { SmartContractAccount } from "../account";
import type { BaseSmartAccountClient } from "../client";
import type {
  BuildUserOperationFromTransactionsResult,
  SendTransactionsParameters,
} from "./types";

export const buildUserOperationFromTxs: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: SendTransactionsParameters<TAccount>
) => Promise<BuildUserOperationFromTransactionsResult> = async (
  client,
  args
) => {
  const { account = client.account, requests, overrides } = args;
  if (!account) {
    throw new Error("No account set on client");
  }

  const batch = requests.map((request) => {
    if (!request.to) {
      throw new Error(
        "one transaction in the batch is missing a target address"
      );
    }

    return {
      target: request.to,
      data: request.data ?? "0x",
      value: request.value ? fromHex(request.value, "bigint") : 0n,
    };
  });

  const mfpgOverridesInTx = () =>
    requests
      .filter((x) => x.maxFeePerGas != null)
      .map((x) => fromHex(x.maxFeePerGas!, "bigint"));
  const maxFeePerGas =
    overrides?.maxFeePerGas != null
      ? overrides?.maxFeePerGas
      : mfpgOverridesInTx().length > 0
      ? bigIntMax(...mfpgOverridesInTx())
      : undefined;

  const mpfpgOverridesInTx = () =>
    requests
      .filter((x) => x.maxPriorityFeePerGas != null)
      .map((x) => fromHex(x.maxPriorityFeePerGas!, "bigint"));
  const maxPriorityFeePerGas =
    overrides?.maxPriorityFeePerGas != null
      ? overrides?.maxPriorityFeePerGas
      : mpfpgOverridesInTx().length > 0
      ? bigIntMax(...mpfpgOverridesInTx())
      : undefined;

  const _overrides: UserOperationOverrides = {
    maxFeePerGas,
    maxPriorityFeePerGas,
  };
  filterUndefined(_overrides);

  return {
    batch,
    overrides: _overrides,
  };
};
