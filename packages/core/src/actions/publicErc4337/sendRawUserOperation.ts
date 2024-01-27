import type { Address, Chain, Client, Hex, Transport } from "viem";
import type { Erc4337RpcSchema } from "../../client/decorators/publicErc4337Client";
import type { UserOperationRequest } from "../../types";

export const sendRawUserOperation = async <
  TClient extends Client<Transport, Chain | undefined, any, Erc4337RpcSchema>
>(
  client: TClient,
  args: {
    request: UserOperationRequest;
    entryPoint: Address;
  }
): Promise<Hex> => {
  return client.request({
    method: "eth_sendUserOperation",
    params: [args.request, args.entryPoint],
  });
};
