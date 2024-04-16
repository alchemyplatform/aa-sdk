import type { Chain, Client, Transport } from "viem";
import {
  type GetEntryPointFromAccount,
  type SmartContractAccount,
} from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import type { UserOperationStruct } from "../../types.js";
import type { Deferrable } from "../../utils/index.js";
import { _runMiddlewareStack } from "./internal/runMiddlewareStack.js";
import type {
  SendUserOperationParameters,
  UserOperationContext,
} from "./types";

export async function buildUserOperation<
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
): Promise<UserOperationStruct<TEntryPointVersion>> {
  const { account = client.account, overrides, uo, context } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "buildUserOperation",
      client
    );
  }

  const entryPoint = account.getEntryPoint();

  const callData = Array.isArray(uo)
    ? account.encodeBatchExecute(uo)
    : typeof uo === "string"
    ? uo
    : account.encodeExecute(uo);

  const signature = account.getDummySignature();

  const nonce = account.getNonce(overrides?.nonceKey);

  const _uo =
    entryPoint.version === "0.6.0"
      ? ({
          initCode: account.getInitCode(),
          sender: account.address,
          nonce,
          callData,
          signature,
        } as Deferrable<UserOperationStruct<TEntryPointVersion>>)
      : ({
          factory: account
            .isAccountDeployed()
            .then((deployed) =>
              !deployed ? account.getFactoryAddress() : undefined
            ),
          factoryData: account
            .isAccountDeployed()
            .then((deployed) =>
              !deployed ? account.getFactoryData() : undefined
            ),
          sender: account.address,
          nonce,
          callData,
          signature,
        } as Deferrable<UserOperationStruct<TEntryPointVersion>>);

  return _runMiddlewareStack(client, {
    uo: _uo,
    overrides,
    account,
    context,
  });
}
