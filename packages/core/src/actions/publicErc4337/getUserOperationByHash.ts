import type { Chain, Client, Hex, Transport } from "viem";
import type { Erc4337RpcSchema } from "../../client/decorators/publicErc4337Client";
import type { UserOperationResponse } from "../../types";

export const getUserOperationByHash = async <
  TClient extends Client<Transport, Chain | undefined, any, Erc4337RpcSchema>
>(
  client: TClient,
  args: {
    hash: Hex;
  }
): Promise<UserOperationResponse | null> => {
  return client.request({
    method: "eth_getUserOperationByHash",
    params: [args.hash],
  });
};
