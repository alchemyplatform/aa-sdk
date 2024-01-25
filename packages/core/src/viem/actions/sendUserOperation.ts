import type { Chain, Transport } from "viem";
import type { SendUserOperationResult } from "../../provider/types";
import type { SmartContractAccount } from "../account";
import type { BaseSmartAccountClient } from "../client";
import { buildUserOperation } from "./buildUserOperation.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import type { SendUserOperationParameters } from "./types.js";

export const sendUserOperation: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TAccount>
) => Promise<SendUserOperationResult> = async (client, args) => {
  const { account = client.account } = args;

  if (!account) {
    throw new Error("No account set on client");
  }

  const uoStruct = await buildUserOperation(client, args);
  return _sendUserOperation(client, { account, uoStruct });
};
