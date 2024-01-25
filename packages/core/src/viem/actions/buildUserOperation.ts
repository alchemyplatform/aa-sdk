import type { Chain, Transport } from "viem";
import type { UserOperationStruct } from "../../types";
import { type Deferrable } from "../../utils/index.js";
import type { SmartContractAccount } from "../account";
import type { BaseSmartAccountClient } from "../client";
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
  const { account = client.account, overrides, data } = args;
  if (!account) {
    throw new Error("No account set on client");
  }

  return _runMiddlewareStack(client, {
    uo: {
      initCode: account.getInitCode(),
      sender: account.address,
      nonce: account.getNonce(),
      callData: Array.isArray(data)
        ? account.encodeBatchExecute(data)
        : typeof data === "string"
        ? data
        : account.encodeExecute(data),
      signature: account.getDummySignature(),
    } as Deferrable<UserOperationStruct>,
    overrides,
    account,
  });
};
