import type { Address, Chain, Client, StateOverride, Transport } from "viem";
import type { BundlerRpcSchema } from "../../client/decorators/bundlerClient";
import type { EntryPointVersion } from "../../entrypoint/types";
import type {
  UserOperationEstimateGasResponse,
  UserOperationRequest,
} from "../../types";

export const estimateUserOperationGas = async <
  TEntryPointVersion extends EntryPointVersion,
  TClient extends Client<
    Transport,
    Chain | undefined,
    any,
    BundlerRpcSchema<TEntryPointVersion>
  >
>(
  client: TClient,
  args: {
    request: UserOperationRequest<TEntryPointVersion>;
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
