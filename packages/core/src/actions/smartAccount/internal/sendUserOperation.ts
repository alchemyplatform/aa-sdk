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
import { MismatchingEntryPointError } from "../../../errors/entrypoint.js";
import { InvalidUserOperationError } from "../../../errors/useroperation.js";
import type { UserOperationRequest, UserOperationStruct } from "../../../types";
import { deepHexlify, isValidRequest } from "../../../utils/index.js";

export async function _sendUserOperation<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: BaseSmartAccountClient<
    TEntryPointVersion,
    TTransport,
    TChain,
    TAccount
  >,
  args: {
    uoStruct: UserOperationStruct<TEntryPointVersion>;
  } & GetAccountParameter<TEntryPointVersion, TAccount>
): Promise<SendUserOperationResult<TEntryPointVersion>> {
  const { account = client.account } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!client.chain) {
    throw new ChainNotFoundError();
  }

  const entryPoint = account.getEntryPoint();
  if (entryPoint.isUserOpVersion(args.uoStruct)) {
    throw new MismatchingEntryPointError(entryPoint.version, args.uoStruct);
  }

  const request = deepHexlify(
    args.uoStruct
  ) as UserOperationRequest<TEntryPointVersion>;
  if (!isValidRequest(request)) {
    throw new InvalidUserOperationError(args.uoStruct);
  }

  request.signature = await account.signUserOperationHash(
    entryPoint.version === "0.6.0"
      ? entryPoint.getUserOperationHash(
          request as UserOperationRequest<"0.6.0">
        )
      : entryPoint.getUserOperationHash(
          request as UserOperationRequest<"0.7.0">
        )
  );

  return {
    hash: await client.sendRawUserOperation(request, entryPoint.address),
    request,
  };
}
