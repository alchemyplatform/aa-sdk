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

/**
 * Performs [`buildUserOperationFromTx`](./buildUserOperationFromTx.md) in batch and builds into a single, yet to be signed `UserOperation` (UO) struct. The output user operation struct will be filled with all gas fields (and paymaster data if a paymaster is used) based on the transactions data (`to`, `data`, `value`, `maxFeePerGas`, `maxPriorityFeePerGas`) computed using the configured [`ClientMiddlewares`](/packages/aa-core/smart-account-client/middleware/index) on the `SmartAccountClient`
 * 
 * @example
 * ```ts
import type { RpcTransactionRequest } from "viem";
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// buildUserOperationFromTx converts a traditional Ethereum transaction and returns
// the unsigned user operation struct after constructing the user operation struct
// through the middleware pipeline
const tx: RpcTransactionRequest = {
  from, // ignored
  to,
  data: encodeFunctionData({
    abi: ContractABI.abi,
    functionName: "func",
    args: [arg1, arg2, ...],
  }),
};
const uoStruct = await smartAccountClient.buildUserOperationFromTx(tx);
 
// signUserOperation signs the above unsigned user operation struct built
// using the account connected to the smart account client
const request = await smartAccountClient.signUserOperation({ uoStruct });
 
// You can use the BundlerAction `sendRawUserOperation` (packages/core/src/actions/bundler/sendRawUserOperation.ts)
// to send the signed user operation request to the bundler, requesting the bundler to send the signed uo to the
// EntryPoint contract pointed at by the entryPoint address parameter
const entryPointAddress = client.account.getEntryPoint().address;
const uoHash = await smartAccountClient.sendRawUserOperation({ request, entryPoint: entryPointAddress });
```
 * 
 * @param client the smart account client to use for RPC requests
 * @param args {@link SendTransactionParameters}
 * @param overrides optional {@link UserOperationOverrides} to use for any of the fields
 * @param context if the smart account client requires additinoal context for building UOs
 * @returns a Promise containing the built user operation
 */
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
