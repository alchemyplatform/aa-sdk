import type { Chain, Transport } from "viem";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient";
import type { SendUserOperationResult } from "../../../client/types";
import type { EntryPointVersion } from "../../../entrypoint/types";
import { AccountNotFoundError } from "../../../errors/account.js";
import { ChainNotFoundError } from "../../../errors/client.js";
import { InvalidEntryPointError } from "../../../errors/entrypoint.js";
import { InvalidUserOperationError } from "../../../errors/useroperation.js";
import type { UserOperationRequest, UserOperationStruct } from "../../../types";
import { deepHexlify, isValidRequest } from "../../../utils/index.js";

export const _sendUserOperation: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: {
    uoStruct: UserOperationStruct<EntryPointVersion>;
  } & GetAccountParameter<TAccount>
) => Promise<SendUserOperationResult> = async (client, args) => {
  const { account = client.account } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!client.chain) {
    throw new ChainNotFoundError();
  }

  const request = deepHexlify(args.uoStruct);
  if (!isValidRequest(request)) {
    throw new InvalidUserOperationError(args.uoStruct);
  }

  const request_ =
    account.getEntryPoint().version === "0.6.0"
      ? (request as UserOperationRequest<"0.6.0">)
      : account.getEntryPoint().version === "0.7.0"
      ? (request as UserOperationRequest<"0.7.0">)
      : undefined;

  if (!request_) {
    throw new InvalidEntryPointError(
      client.chain,
      account.getEntryPoint().version
    );
  }

  request.signature = await account.signUserOperationHash(
    account.getEntryPoint().getUserOperationHash(request_)
  );

  return {
    hash: await client.sendRawUserOperation(
      request,
      account.getEntryPoint().address
    ),
    request,
  };
};
