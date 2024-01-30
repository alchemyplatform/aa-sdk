import type { Address, Chain, Client, Hex, Transport } from "viem";
import type { BundlerRpcSchema } from "../../client/decorators/bundlerClient";
import type { UserOperationRequest } from "../../types";

export const sendRawUserOperation = async <
  TClient extends Client<Transport, Chain | undefined, any, BundlerRpcSchema>
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
