import type { Chain, Client, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import type { SendUserOperationResult } from "../../client/types.js";
import type { EntryPointVersion } from "../../entrypoint/types.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { buildUserOperation } from "./buildUserOperation.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import type { SendUserOperationParameters } from "./types.js";

export const sendUserOperation: <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TEntryPointVersion, TAccount>
) => Promise<SendUserOperationResult<TEntryPointVersion>> = async (
  client,
  args
) => {
  const { account = client.account } = args;

  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "sendUserOperation",
      client
    );
  }

  const entryPoint = account.getEntryPoint();

  const uoStruct = await buildUserOperation(client, args);
  return _sendUserOperation<typeof entryPoint.version>(client, {
    account,
    uoStruct,
  });
};
