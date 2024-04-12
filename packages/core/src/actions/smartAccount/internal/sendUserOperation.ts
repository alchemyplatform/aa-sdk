import type { Chain, Transport } from "viem";
import type {
  GetAccountParameter,
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient";
import type { SendUserOperationResult } from "../../../client/types";
import { AccountNotFoundError } from "../../../errors/account.js";
import { ChainNotFoundError } from "../../../errors/client.js";
import { InvalidUserOperationError } from "../../../errors/useroperation.js";
import type { UserOperationRequest, UserOperationStruct } from "../../../types";
import { deepHexlify, isValidRequest } from "../../../utils/index.js";

export async function _sendUserOperation<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: {
    uoStruct: UserOperationStruct<TEntryPointVersion>;
  } & GetAccountParameter<TAccount>
): Promise<SendUserOperationResult<TEntryPointVersion>> {
  const { account = client.account } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!client.chain) {
    throw new ChainNotFoundError();
  }

  const entryPoint = account.getEntryPoint();

  const request = deepHexlify(
    args.uoStruct
  ) as UserOperationRequest<TEntryPointVersion>;
  if (!isValidRequest(request)) {
    throw new InvalidUserOperationError(args.uoStruct);
  }

  console.log("request", client.chain.name, request);

  request.signature = await account.signUserOperationHash(
    entryPoint.getUserOperationHash(request)
  );

  return {
    hash: await client.sendRawUserOperation(request, entryPoint.address),
    request,
  };
}
