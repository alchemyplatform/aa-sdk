import type { Chain, Client, Transport } from "viem";
import type {
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import {
  ChainNotFoundError,
  IncompatibleClientError,
} from "../../errors/client.js";
import { InvalidUserOperationError } from "../../errors/useroperation.js";
import type { UserOperationRequest } from "../../types";
import { deepHexlify, isValidRequest } from "../../utils/index.js";
import type { SignUserOperationParameters } from "./types";

export async function signUserOperation<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SignUserOperationParameters<TAccount>
): Promise<UserOperationRequest<TEntryPointVersion>> {
  const { account = client.account } = args;

  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "signUserOperation",
      client
    );
  }

  if (!client.chain) {
    throw new ChainNotFoundError();
  }

  const request = deepHexlify(args.uoStruct);
  if (!isValidRequest(request)) {
    throw new InvalidUserOperationError(args.uoStruct);
  }

  const entryPoint = account.getEntryPoint();
  request.signature = await account.signUserOperationHash(
    entryPoint.getUserOperationHash(request)
  );

  return request as UserOperationRequest<TEntryPointVersion>;
}
