import type { Address, Chain, Client, Transport } from "viem";
import type { Erc4337RpcSchema } from "../../client/decorators/publicErc4337Client";
import type {
  UserOperationEstimateGasResponse,
  UserOperationRequest,
} from "../../types";

export const estimateUserOperationGas = async <
  TClient extends Client<Transport, Chain | undefined, any, Erc4337RpcSchema>
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
