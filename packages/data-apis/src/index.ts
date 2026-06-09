// client
export type { AlchemyDataClient, AlchemyDataClientOptions } from "./client.js";
export { createAlchemyDataClient } from "./client.js";

// decorator
export type { DataActions } from "./decorator.js";
export { dataActions } from "./decorator.js";

// actions (individually importable for tree-shaking / composability)
export { getTokensByAddress } from "./actions/portfolio/getTokensByAddress.js";
export { getNftsForOwner } from "./actions/nft/getNftsForOwner.js";
export { getAssetTransfers } from "./actions/transfers/getAssetTransfers.js";

// schemas
export type { DataRpcSchema } from "./schema/rpc.js";
export type { PortfolioRestSchema, NftRestSchema } from "./schema/rest.js";

// types
export type * from "./types.js";

export { VERSION } from "./version.js";
