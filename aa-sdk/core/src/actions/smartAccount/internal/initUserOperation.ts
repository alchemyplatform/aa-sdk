import type { Chain, Transport } from "viem";
import type {
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../../account/smartContractAccount.js";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient.js";
import { AccountNotFoundError } from "../../../errors/account.js";
import { ChainNotFoundError } from "../../../errors/client.js";
import type { UserOperationStruct } from "../../../types.js";
import { conditionalReturn, type Deferrable } from "../../../utils/index.js";
import type {
  BuildUserOperationParameters,
  SendUserOperationParameters,
  UserOperationContext,
} from "../types.js";

/**
 * Description internal action function of SmartAccountClient for initializing
 * a user operation for the sender account
 *
 * @async
 * @template {Transport} TTransport
 * @template {Chain | undefined} TChain
 * @template {SmartContractAccount | undefined} TAccount
 * @template {UserOperationContext | undefined} TContext
 * @template {GetEntryPointFromAccount} TEntryPointVersion
 * @param client smart account client
 * @param args send user operation parameters
 * @returns initialized user operation struct
 */
export async function _initUserOperation<
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
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args:
    | SendUserOperationParameters<TAccount, TContext, TEntryPointVersion>
    | BuildUserOperationParameters<TAccount, TContext, TEntryPointVersion>
): Promise<Deferrable<UserOperationStruct<TEntryPointVersion>>> {
  const { account = client.account, uo, overrides } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!client.chain) {
    throw new ChainNotFoundError();
  }

  const entryPoint = account.getEntryPoint();

  const callData = Array.isArray(uo)
    ? account.encodeBatchExecute(uo)
    : typeof uo === "string"
    ? uo
    : account.encodeExecute(uo);

  const signature = account.getDummySignature();

  const nonce = account.getNonce(overrides?.nonceKey);

  const struct =
    entryPoint.version === "0.6.0"
      ? ({
          initCode: account.getInitCode(),
          sender: account.address,
          nonce,
          callData,
          signature,
        } as Deferrable<UserOperationStruct<TEntryPointVersion>>)
      : ({
          factory: conditionalReturn(
            account.isAccountDeployed().then((deployed) => !deployed),
            account.getFactoryAddress
          ),
          factoryData: conditionalReturn(
            account.isAccountDeployed().then((deployed) => !deployed),
            account.getFactoryData
          ),
          sender: account.address,
          nonce,
          callData,
          signature,
        } as Deferrable<UserOperationStruct<TEntryPointVersion>>);

  return struct;
}
