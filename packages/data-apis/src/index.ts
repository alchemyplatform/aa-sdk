// client
export type { AlchemyDataClient, AlchemyDataClientOptions } from "./client.js";
export { createDataClient } from "./client.js";

// decorator
export type { DataActions } from "./decorator.js";
export { dataActions } from "./decorator.js";

// per-request options
export type { RequestOptions } from "./internal/clientHelpers.js";

// actions (individually importable for tree-shaking / composability)
export { getTokensByAddress } from "./actions/portfolio/getTokensByAddress.js";
export { getTokenBalancesByAddress } from "./actions/portfolio/getTokenBalancesByAddress.js";
export { getNftsByAddress } from "./actions/portfolio/getNftsByAddress.js";
export { getNftContractsByAddress } from "./actions/portfolio/getNftContractsByAddress.js";
export { getTokenPricesBySymbol } from "./actions/prices/getTokenPricesBySymbol.js";
export { getTokenPricesByAddress } from "./actions/prices/getTokenPricesByAddress.js";
export { getHistoricalTokenPrices } from "./actions/prices/getHistoricalTokenPrices.js";
export { getNftsForOwner } from "./actions/nft/getNftsForOwner.js";
export { getNftsForContract } from "./actions/nft/getNftsForContract.js";
export { getNftsForCollection } from "./actions/nft/getNftsForCollection.js";
export { getNftMetadata } from "./actions/nft/getNftMetadata.js";
export { getNftMetadataBatch } from "./actions/nft/getNftMetadataBatch.js";
export { getContractMetadata } from "./actions/nft/getContractMetadata.js";
export { getContractMetadataBatch } from "./actions/nft/getContractMetadataBatch.js";
export { getCollectionMetadata } from "./actions/nft/getCollectionMetadata.js";
export { getContractsForOwner } from "./actions/nft/getContractsForOwner.js";
export { getCollectionsForOwner } from "./actions/nft/getCollectionsForOwner.js";
export { getOwnersForNft } from "./actions/nft/getOwnersForNft.js";
export { getOwnersForContract } from "./actions/nft/getOwnersForContract.js";
export { getNftSales } from "./actions/nft/getNftSales.js";
export { getFloorPrice } from "./actions/nft/getFloorPrice.js";
export { searchContractMetadata } from "./actions/nft/searchContractMetadata.js";
export { getSpamContracts } from "./actions/nft/getSpamContracts.js";
export { isSpamContract } from "./actions/nft/isSpamContract.js";
export { isAirdropNft } from "./actions/nft/isAirdropNft.js";
export { isHolderOfContract } from "./actions/nft/isHolderOfContract.js";
export { computeRarity } from "./actions/nft/computeRarity.js";
export { summarizeNftAttributes } from "./actions/nft/summarizeNftAttributes.js";
export { getTokenBalances } from "./actions/token/getTokenBalances.js";
export { getTokenMetadata } from "./actions/token/getTokenMetadata.js";
export { getTokenAllowance } from "./actions/token/getTokenAllowance.js";
export { getAssetTransfers } from "./actions/transfers/getAssetTransfers.js";

// schemas
export type { DataRpcSchema } from "./schema/rpc.js";
export type {
  NftRestSchema,
  PortfolioRestSchema,
  PricesRestSchema,
} from "./schema/rest.js";

// types
export type * from "./types.js";

export { VERSION } from "./version.js";
