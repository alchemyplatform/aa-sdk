import type { Chain, Client, Hex, Transport } from "viem";
import type { BundlerRpcSchema } from "../../client/decorators/bundlerClient";
import type { EntryPointVersion } from "../../entrypoint/types";
import type { UserOperationReceipt } from "../../types";

export const getUserOperationReceipt = async <
  TClient extends Client<
    Transport,
    Chain | undefined,
    any,
    BundlerRpcSchema<EntryPointVersion>
  >
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
