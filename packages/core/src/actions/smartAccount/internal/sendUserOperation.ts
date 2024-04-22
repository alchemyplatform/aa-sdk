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
import { deepHexlify, resolveProperties } from "../../../utils/index.js";
import type { GetContextParameter, UserOperationContext } from "../types";

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
  const { account = client.account, context, overrides } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!client.chain) {
    throw new ChainNotFoundError();
  }

  const request = await client.middleware
    .signUserOperation(args.uoStruct, {
      overrides,
      account,
      client,
      context,
    })
    .then(resolveProperties)
    .then(deepHexlify);

  return {
    hash: await client.sendRawUserOperation(
      request,
      account.getEntryPoint().address
    ),
    request,
  };
}
