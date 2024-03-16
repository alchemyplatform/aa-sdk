import type { Address, Chain, Client, Transport } from "viem";
import type { BundlerRpcSchema } from "../../client/decorators/bundlerClient";

export const getSupportedEntryPoints = async <
  TClient extends Client<Transport, Chain | undefined, any, BundlerRpcSchema>
>(
  client: TClient
): Promise<Address[]> => {
  // TODO pass along entryPointVersion over rpc request
  // to get support entry points for the entry point version
  return client.request({
    method: "eth_supportedEntryPoints",
    params: [],
  });
};
