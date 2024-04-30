import { fromHex, type Chain, type Client, type Transport } from "viem";
import type {
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { TransactionMissingToParamError } from "../../errors/transaction.js";
import type { UserOperationOverrides } from "../../types";
import { bigIntMax } from "../../utils/index.js";
import { buildUserOperation } from "./buildUserOperation.js";
import type {
  BuildTransactionParameters,
  BuildUserOperationFromTransactionsResult,
  UserOperationContext,
} from "./types";

/**
 * Performs {@link buildUserOperationFromTx} in batch and builds into a single,
 * yet to be signed `UserOperation` (UO) struct. The output user operation struct
 * will be filled with all gas fields (and paymaster data if a paymaster is used)
 * based on the transactions data (`to`, `data`, `value`, `maxFeePerGas`,
 * `maxPriorityFeePerGas`) computed using the configured
 * [`ClientMiddlewares`](/packages/aa-core/smart-account-client/middleware/index) on the `SmartAccountClient`
 * 
 * @example
 * ```ts
 * import type { RpcTransactionRequest } from "viem";
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// buildUserOperationFromTxs converts traditional Ethereum transactions in batch and returns
// the unsigned user operation struct after constructing the user operation struct
// through the middleware pipeline
const requests: RpcTransactionRequest[] = [
  {
    from, // ignored
    to,
    data: encodeFunctionData({
      abi: ContractABI.abi,
      functionName: "func",
      args: [arg1, arg2, ...],
    }),
  },
  {
    from, // ignored
    to,
    data: encodeFunctionData({
      abi: ContractABI.abi,
      functionName: "func",
      args: [arg1, arg2, ...],
    }),
  },
  ...
  {
    from, // ignored
    to,
    data: encodeFunctionData({
      abi: ContractABI.abi,
      functionName: "func",
      args: [arg1, arg2, ...],
    }),
  },
];
const uoStruct = await smartAccountClient.buildUserOperationFromTxs({
  requests,
});
 
// signUserOperation signs the above unsigned user operation struct built
// using the account connected to the smart account client
const request = await smartAccountClient.signUserOperation({ uoStruct });
 
// You can use the BundlerAction `sendRawUserOperation` (packages/core/src/actions/bundler/sendRawUserOperation.ts)
// to send the signed user operation request to the bundler, requesting the bundler to send the signed uo to the
// EntryPoint contract pointed at by the entryPoint address parameter
const entryPointAddress = client.account.getEntryPoint().address;
const uoHash = await smartAccountClient.sendRawUserOperation({
  request,
  entryPoint: entryPointAddress,
});
 * ```
 *
 * @param client the smart account client to use to make RPC calls
 * @param args {@link BuildTransactionParameters} an object containing the requests
 * to build as well as, the account if not hoisted, the context, the overrides, and
 * optionally a flag to enable signing of the UO via the underlying middleware
 * @returns a Promise containing the built user operation
 */
export async function buildUserOperationFromTxs<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: BuildTransactionParameters<TAccount, TContext, TEntryPointVersion>
): Promise<BuildUserOperationFromTransactionsResult<TEntryPointVersion>> {
  const { account = client.account, requests, overrides, context } = args;
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

  const uoStruct = await buildUserOperation(client, {
    uo: batch,
    account,
    context,
    overrides: _overrides,
  });

  return {
    uoStruct,
    // TODO: in v4 major version update, remove these as below parameters are not needed
    batch,
    overrides: _overrides,
  };
}
