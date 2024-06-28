import type { Chain, Client, Transport } from "viem";
import {
  type GetEntryPointFromAccount,
  type SmartContractAccount,
} from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import type { UserOperationEstimateGasResponse } from "../../types.js";
import { deepHexlify, resolveProperties } from "../../utils/index.js";
import { _initUserOperation } from "./internal/initUserOperation.js";
import type {
  SendUserOperationParameters,
  UserOperationContext,
} from "./types.js";

/**
 * Description SmartAccountClientAction for estimating the gas cost of a user operation
 *
 * @async
 * @template {Transport} TTransport
 * @template {Chain | undefined} TChain
 * @template {SmartContractAccount | undefined} TAccount
 * @template {UserOperationContext | undefined} TContext
 * @template {GetEntryPointFromAccount<TAccount>} TEntryPointVersion
 * @param client smart account client
 * @param args send user operation parameters
 * @returns user operation gas estimate response
 */
export async function estimateUserOperationGas<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TAccount, TContext>
): Promise<UserOperationEstimateGasResponse<TEntryPointVersion>> {
  const { account = client.account, overrides } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "estimateUserOperationGas",
      client
    );
  }

  return _initUserOperation(client, args).then(async (struct) => {
    const request = deepHexlify(await resolveProperties(struct));
    return client.estimateUserOperationGas(
      request,
      account.getEntryPoint().address,
      overrides?.stateOverride
    );
  });
}
