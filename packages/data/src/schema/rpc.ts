import type { GetAssetTransfersResult } from "../types.js";

// NOTE(mvp): hand-written RpcSchema entry; the production plan generates these
// from the docs repo's bundled OpenRPC specs (alchemy_getAssetTransfers et al).

export type GetAssetTransfersRpcParams = {
  fromBlock?: string;
  toBlock?: string;
  fromAddress?: string;
  toAddress?: string;
  excludeZeroValue?: boolean;
  category: string[];
  contractAddresses?: string[];
  order?: "asc" | "desc";
  withMetadata?: boolean;
  pageKey?: string;
  maxCount?: string;
};

/**
 * viem RpcSchema entries for the Data JSON-RPC methods. Attach to a client to
 * get typed `client.request({ method: "alchemy_getAssetTransfers", ... })`.
 */
export type DataRpcSchema = [
  {
    Method: "alchemy_getAssetTransfers";
    Parameters: [GetAssetTransfersRpcParams];
    ReturnType: GetAssetTransfersResult;
  },
];
