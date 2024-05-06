import type { Chain, Transport } from "viem";
import type {
  GetAccountParameter,
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient";
import type { SendUserOperationResult } from "../../../client/types";
import { AccountNotFoundError } from "../../../errors/account.js";
import { ChainNotFoundError } from "../../../errors/client.js";
import type {
  UserOperationOverrides,
  UserOperationStruct,
} from "../../../types";
import { signUserOperation } from "../signUserOperation.js";
import type { GetContextParameter, UserOperationContext } from "../types";

/**
 * Used internally to send a user operation that has **already** been signed
 *
 * @param client a base smart account client instance with middleware configured
 * @param args user operation struct, overrides, account, and context to be used in sending
 * @returns A Promise containing the send user operation result {@link SendUserOperationResult}
 */
export async function _sendUserOperation<
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
  args: {
    uoStruct: UserOperationStruct<TEntryPointVersion>;
    overrides?: UserOperationOverrides<TEntryPointVersion>;
  } & GetAccountParameter<TAccount> &
    GetContextParameter<TContext>
): Promise<SendUserOperationResult<TEntryPointVersion>> {
  const { account = client.account, uoStruct, context, overrides } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!client.chain) {
    throw new ChainNotFoundError();
  }

  const entryPoint = account.getEntryPoint();
  const request = await signUserOperation(client, {
    uoStruct,
    account,
    context,
    overrides,
  });

  return {
    hash: await client.sendRawUserOperation(request, entryPoint.address),
    request,
  };
}
