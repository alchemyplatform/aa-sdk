import type {
  GetAssetTransfersParams,
  GetAssetTransfersResult,
  GetNftsForOwnerParams,
  GetNftsForOwnerResult,
  GetTokensByAddressParams,
  GetTokensByAddressResult,
} from "./types.js";
import type { DataClient } from "./internal/clientHelpers.js";
import { getTokensByAddress } from "./actions/portfolio/getTokensByAddress.js";
import { getNftsForOwner } from "./actions/nft/getNftsForOwner.js";
import { getAssetTransfers } from "./actions/transfers/getAssetTransfers.js";

/** The namespaced Data API actions attached by the {@link dataActions} decorator. */
export type DataActions = {
  portfolio: {
    getTokensByAddress: (
      params: GetTokensByAddressParams,
    ) => Promise<GetTokensByAddressResult>;
  };
  nft: {
    getNftsForOwner: (
      params: GetNftsForOwnerParams,
    ) => Promise<GetNftsForOwnerResult>;
  };
  transfers: {
    getAssetTransfers: (
      params: GetAssetTransfersParams,
    ) => Promise<GetAssetTransfersResult>;
  };
};

/**
 * A viem client decorator that attaches the Data API actions, grouped by
 * namespace, to any client configured with an Alchemy transport.
 *
 * @example
 * ```ts
 * import { createClient } from "viem";
 * import { mainnet } from "viem/chains";
 * import { alchemyTransport } from "@alchemy/common";
 * import { dataActions } from "@alchemy/data";
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: alchemyTransport({ apiKey: "..." }),
 * }).extend(dataActions);
 *
 * const nfts = await client.nft.getNftsForOwner({ owner: "0x..." });
 * ```
 *
 * @param {DataClient} client The client to decorate
 * @returns {DataActions} The namespaced Data API actions
 */
export function dataActions(client: DataClient): DataActions {
  return {
    portfolio: {
      getTokensByAddress: (params) => getTokensByAddress(client, params),
    },
    nft: {
      getNftsForOwner: (params) => getNftsForOwner(client, params),
    },
    transfers: {
      getAssetTransfers: (params) => getAssetTransfers(client, params),
    },
  };
}
