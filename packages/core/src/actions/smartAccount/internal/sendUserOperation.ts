import type { Chain, Transport } from "viem";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient";
import type { SendUserOperationResult } from "../../../client/types";
import { AccountNotFoundError } from "../../../errors/account.js";
import { ChainNotFoundError } from "../../../errors/client.js";
import { InvalidUserOperationError } from "../../../errors/useroperation.js";
import type { UserOperationStruct } from "../../../types";
import {
  deepHexlify,
  getUserOperationHash,
  isValidRequest,
} from "../../../utils/index.js";

export const _sendUserOperation: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: { uoStruct: UserOperationStruct } & GetAccountParameter<TAccount>
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

  request.signature = await account.signUserOperationHash(
    getUserOperationHash(
      request,
      account.getEntrypoint(),
      BigInt(client.chain.id)
    )
  );

  return {
    hash: await client.sendRawUserOperation(request, account.getEntrypoint()),
    request,
  };
};
