import type { Address, Chain, Client, Transport } from "viem";
import type { Erc4337RpcSchema } from "../../client/decorators/publicErc4337Client";

export const getSupportedEntryPoints = async <
  TClient extends Client<Transport, Chain | undefined, any, Erc4337RpcSchema>
>(
  client: TClient
): Promise<Address[]> => {
  return client.request({
    method: "eth_supportedEntryPoints",
    params: [],
  });
};
