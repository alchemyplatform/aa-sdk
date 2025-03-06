import type { Address, Chain, Client, StateOverride, Transport } from "viem";
import type { BundlerRpcSchema } from "../../client/decorators/bundlerClient";
import type { EntryPointVersion } from "../../entrypoint/types";
import type {
  UserOperationEstimateGasResponse,
  UserOperationRequest,
} from "../../types";
import { serializeStateOverride } from "../../utils/stateOverride.js";

export const estimateUserOperationGas = async <
  TClient extends Client<Transport, Chain | undefined, any, BundlerRpcSchema>,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(
  client: TClient,
  args: {
    request: UserOperationRequest<TEntryPointVersion>;
    entryPoint: Address;
    stateOverride?: StateOverride;
  }
): Promise<UserOperationEstimateGasResponse<TEntryPointVersion>> => {
  return client.request({
    method: "eth_estimateUserOperationGas",
    params:
      args.stateOverride != null
        ? [
            args.request,
            args.entryPoint,
            serializeStateOverride(args.stateOverride),
          ]
        : [args.request, args.entryPoint],
  });
};
