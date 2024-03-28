import type { Chain, Client, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import type { UserOperationStruct } from "../../types.js";
import type { Deferrable } from "../../utils/index.js";
import { _runMiddlewareStack } from "./internal/runMiddlewareStack.js";
import type { SendUserOperationParameters } from "./types";

export const buildUserOperation: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends Record<string, any> = Record<string, any>
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TAccount, TContext>
) => Promise<UserOperationStruct> = async (client, args) => {
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

  return _runMiddlewareStack(client, {
    uo: {
      initCode: account.getInitCode(),
      sender: account.address,
      nonce: account.getNonce(overrides?.nonceKey),
      callData: Array.isArray(uo)
        ? account.encodeBatchExecute(uo)
        : typeof uo === "string"
        ? uo
        : account.encodeExecute(uo),
      signature: account.getDummySignature(),
    } as Deferrable<UserOperationStruct>,
    overrides,
    account,
    context,
  });
};
