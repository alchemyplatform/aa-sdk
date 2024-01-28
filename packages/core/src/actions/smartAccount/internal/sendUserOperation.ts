import type { Chain, Transport } from "viem";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient";
import type { SendUserOperationResult } from "../../../client/types";
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
    throw new Error("No account set on client");
  }

  if (!client.chain) {
    throw new Error("cannot sendUserOperation without a chain");
  }

  const request = deepHexlify(args.uoStruct);
  if (!isValidRequest(request)) {
    // this pretty prints the uo
    throw new Error(
      `Request is missing parameters. All properties on UserOperationStruct must be set. uo: ${JSON.stringify(
        args.uoStruct,
        null,
        2
      )}`
    );
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
