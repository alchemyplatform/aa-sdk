// client
export type {
  AlchemyDataClient,
  AlchemyDataClientConfig,
  AlchemyDataClientOptions,
} from "./client.js";
export { createDataClient } from "./client.js";

// errors
export {
  AlchemyApiError,
  AlchemyError,
  type AlchemyApiErrorDetails,
} from "@alchemy/common/core";

// actions surface type (the viem adapter ships as /viem post-v1; the
// dataActions decorator itself is internal to the core)
export type { DataActions } from "./decorator.js";

// per-request options
export type { RequestOptions } from "./internal/clientHelpers.js";
export type { PaginateOptions } from "./internal/paginate.js";

// actions (individually importable for tree-shaking / composability)
export { getTokensByAddress } from "./actions/portfolio/getTokensByAddress.js";
export { getTokenBalancesByAddress } from "./actions/portfolio/getTokenBalancesByAddress.js";
export { getNftsByAddress } from "./actions/portfolio/getNftsByAddress.js";
export { getNftContractsByAddress } from "./actions/portfolio/getNftContractsByAddress.js";
export { getNftsByAddressPages } from "./actions/portfolio/getNftsByAddressPages.js";
export { getNftContractsByAddressPages } from "./actions/portfolio/getNftContractsByAddressPages.js";
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
export { getNftsForOwnerPages } from "./actions/nft/getNftsForOwnerPages.js";
export { getNftsForContractPages } from "./actions/nft/getNftsForContractPages.js";
export { getNftsForCollectionPages } from "./actions/nft/getNftsForCollectionPages.js";
export { getContractsForOwnerPages } from "./actions/nft/getContractsForOwnerPages.js";
export { getCollectionsForOwnerPages } from "./actions/nft/getCollectionsForOwnerPages.js";
export { getNftSalesPages } from "./actions/nft/getNftSalesPages.js";
export { getTokenBalances } from "./actions/token/getTokenBalances.js";
export { getTokenMetadata } from "./actions/token/getTokenMetadata.js";
export { getTokenAllowance } from "./actions/token/getTokenAllowance.js";
export { getAssetTransfers } from "./actions/transfers/getAssetTransfers.js";
export { getAssetTransfersPages } from "./actions/transfers/getAssetTransfersPages.js";

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
