import type { Chain, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import type { BaseSmartAccountClient } from "../../client/smartAccountClient.js";
import type { SendUserOperationResult } from "../../client/types.js";
import { AccountNotFoundError } from "../../errors/account.js";
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
    throw new AccountNotFoundError();
  }

  const uoStruct = await buildUserOperation(client, args);
  return _sendUserOperation(client, { account, uoStruct });
};
