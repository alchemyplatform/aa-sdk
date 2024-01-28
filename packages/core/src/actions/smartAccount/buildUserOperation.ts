import type { Chain, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import type { BaseSmartAccountClient } from "../../client/smartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import type { UserOperationStruct } from "../../types.js";
import type { Deferrable } from "../../utils/index.js";
import { _runMiddlewareStack } from "./internal/runMiddlewareStack.js";
import type { SendUserOperationParameters } from "./types";

export const buildUserOperation: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TAccount>
) => Promise<UserOperationStruct> = async (client, args) => {
  const { account = client.account, overrides, uo } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  return _runMiddlewareStack(client, {
    uo: {
      initCode: account.getInitCode(),
      sender: account.address,
      nonce: account.getNonce(),
      callData: Array.isArray(uo)
        ? account.encodeBatchExecute(uo)
        : typeof uo === "string"
        ? uo
        : account.encodeExecute(uo),
      signature: account.getDummySignature(),
    } as Deferrable<UserOperationStruct>,
    overrides,
    account,
  });
};
