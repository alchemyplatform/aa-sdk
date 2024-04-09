import type { Address, Chain, Client, StateOverride, Transport } from "viem";
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
    stateOverride?: StateOverride;
  }
): Promise<UserOperationEstimateGasResponse> => {
  return client.request({
    method: "eth_estimateUserOperationGas",
    params:
      args.stateOverride != null
        ? [args.request, args.entryPoint, args.stateOverride]
        : [args.request, args.entryPoint],
  });
};
