import type { Chain, Client, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import type { SendUserOperationResult } from "../../client/types.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
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
  client: Client<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TAccount>
) => Promise<SendUserOperationResult> = async (client, args) => {
  const { account = client.account } = args;

  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "sendUserOperation"
    );
  }

  const uoStruct = await buildUserOperation(client, args);
  return _sendUserOperation(client, { account, uoStruct });
};
