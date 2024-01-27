import type { Chain, Client, Hex, Transport } from "viem";
import type { Erc4337RpcSchema } from "../../client/decorators/publicErc4337Client";
import type { UserOperationReceipt } from "../../types";

export const getUserOperationReceipt = async <
  TClient extends Client<Transport, Chain | undefined, any, Erc4337RpcSchema>
>(
  client: TClient,
  args: {
    hash: Hex;
  }
): Promise<UserOperationReceipt | null> => {
  return client.request({
    method: "eth_getUserOperationReceipt",
    params: [args.hash],
  });
};
