import { fromHex, type Chain, type Client, type Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import type { EntryPointVersion } from "../../entrypoint/types";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { TransactionMissingToParamError } from "../../errors/transaction.js";
import type { UserOperationOverrides } from "../../types";
import { bigIntMax, filterUndefined } from "../../utils/index.js";
import { buildUserOperation } from "./buildUserOperation.js";
import type {
  BuildUserOperationFromTransactionsResult,
  SendTransactionsParameters,
} from "./types";

export async function buildUserOperationFromTxs<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SendTransactionsParameters<TEntryPointVersion, TAccount>
): Promise<BuildUserOperationFromTransactionsResult<TEntryPointVersion>> {
  const { account = client.account, requests, overrides } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "buildUserOperationFromTxs",
      client
    );
  }

  const batch = requests.map((request) => {
    if (!request.to) {
      throw new TransactionMissingToParamError();
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

  const _overrides = {
    maxFeePerGas,
    maxPriorityFeePerGas,
  } as UserOperationOverrides<TEntryPointVersion>;
  filterUndefined(_overrides);

  const uoStruct = await buildUserOperation(client, {
    uo: batch,
    overrides: _overrides,
    account: account as SmartContractAccount<TEntryPointVersion>,
  });

  return {
    uoStruct,
    // TODO: in v4 major version update, remove these as below parameters are not needed
    batch,
    overrides: _overrides,
  };
}
