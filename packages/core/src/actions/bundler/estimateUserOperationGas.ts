import type { Address, Chain, Client, Transport } from "viem";
import type { BundlerRpcSchema } from "../../client/decorators/bundlerClient";
import type {
  UserOperationEstimateGasResponse,
  UserOperationRequest,
} from "../../types";

export const estimateUserOperationGas = async <
  TClient extends Client<Transport, Chain | undefined, any, BundlerRpcSchema>
>(
  client: TClient,
  args: {
    request: UserOperationRequest;
    entryPoint: Address;
  }
): Promise<UserOperationEstimateGasResponse> => {
  return client.request({
    method: "eth_estimateUserOperationGas",
    params: [args.request, args.entryPoint],
  });
};
