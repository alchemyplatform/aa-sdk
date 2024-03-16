import type { Chain, Client, Hex, Transport } from "viem";
import type { BundlerRpcSchema } from "../../client/decorators/bundlerClient";
import type { EntryPointVersion } from "../../entrypoint/types";
import type { UserOperationResponse } from "../../types";

export const getUserOperationByHash = async <
  TClient extends Client<
    Transport,
    Chain | undefined,
    any,
    BundlerRpcSchema<TEntryPointVersion>
  >,
  TEntryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined
>(
  client: TClient,
  args: {
    hash: Hex;
  }
): Promise<UserOperationResponse<TEntryPointVersion> | null> => {
  // TODO pass along entryPointVersion over rpc request
  // to get support entry points for the entry point version
  return client.request({
    method: "eth_getUserOperationByHash",
    params: [args.hash],
  });
};
