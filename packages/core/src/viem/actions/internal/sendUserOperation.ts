import type { Chain, Transport } from "viem";
import type { SendUserOperationResult } from "../../../provider/types.js";
import type { UserOperationStruct } from "../../../types.js";
import {
  deepHexlify,
  getUserOperationHash,
  isValidRequest,
} from "../../../utils/index.js";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../account.js";
import type { BaseSmartAccountClient } from "../../client.js";

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

  request.signature = (await account.signUserOperationHash(
    getUserOperationHash(
      request,
      account.getEntrypoint(),
      BigInt(client.chain.id)
    )
  )) as `0x${string}`;

  return {
    hash: await client.sendRawUserOperation(request, account.getEntrypoint()),
    request,
  };
};
