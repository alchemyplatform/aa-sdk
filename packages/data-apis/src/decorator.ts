import type { DataClient, RequestOptions } from "./internal/clientHelpers.js";
import type { PaginateOptions } from "./internal/paginate.js";
import type * as T from "./types.js";

import { getTokensByAddress } from "./actions/portfolio/getTokensByAddress.js";
import { getTokenBalancesByAddress } from "./actions/portfolio/getTokenBalancesByAddress.js";
import { getNftsByAddress } from "./actions/portfolio/getNftsByAddress.js";
import { getNftContractsByAddress } from "./actions/portfolio/getNftContractsByAddress.js";
import { getNftsByAddressPages } from "./actions/portfolio/getNftsByAddressPages.js";
import { getNftContractsByAddressPages } from "./actions/portfolio/getNftContractsByAddressPages.js";

import { getTokenPricesBySymbol } from "./actions/prices/getTokenPricesBySymbol.js";
import { getTokenPricesByAddress } from "./actions/prices/getTokenPricesByAddress.js";
import { getHistoricalTokenPrices } from "./actions/prices/getHistoricalTokenPrices.js";

import { getNftsForOwner } from "./actions/nft/getNftsForOwner.js";
import { getNftsForContract } from "./actions/nft/getNftsForContract.js";
import { getNftsForCollection } from "./actions/nft/getNftsForCollection.js";
import { getNftMetadata } from "./actions/nft/getNftMetadata.js";
import { getNftMetadataBatch } from "./actions/nft/getNftMetadataBatch.js";
import { getContractMetadata } from "./actions/nft/getContractMetadata.js";
import { getContractMetadataBatch } from "./actions/nft/getContractMetadataBatch.js";
import { getCollectionMetadata } from "./actions/nft/getCollectionMetadata.js";
import { getContractsForOwner } from "./actions/nft/getContractsForOwner.js";
import { getCollectionsForOwner } from "./actions/nft/getCollectionsForOwner.js";
import { getOwnersForNft } from "./actions/nft/getOwnersForNft.js";
import { getOwnersForContract } from "./actions/nft/getOwnersForContract.js";
import { getNftSales } from "./actions/nft/getNftSales.js";
import { getFloorPrice } from "./actions/nft/getFloorPrice.js";
import { searchContractMetadata } from "./actions/nft/searchContractMetadata.js";
import { getSpamContracts } from "./actions/nft/getSpamContracts.js";
import { isSpamContract } from "./actions/nft/isSpamContract.js";
import { isAirdropNft } from "./actions/nft/isAirdropNft.js";
import { isHolderOfContract } from "./actions/nft/isHolderOfContract.js";
import { computeRarity } from "./actions/nft/computeRarity.js";
import { summarizeNftAttributes } from "./actions/nft/summarizeNftAttributes.js";
import { getNftsForOwnerPages } from "./actions/nft/getNftsForOwnerPages.js";
import { getNftsForContractPages } from "./actions/nft/getNftsForContractPages.js";
import { getNftsForCollectionPages } from "./actions/nft/getNftsForCollectionPages.js";
import { getContractsForOwnerPages } from "./actions/nft/getContractsForOwnerPages.js";
import { getCollectionsForOwnerPages } from "./actions/nft/getCollectionsForOwnerPages.js";
import { getNftSalesPages } from "./actions/nft/getNftSalesPages.js";

import { getTokenBalances } from "./actions/token/getTokenBalances.js";
import { getTokenMetadata } from "./actions/token/getTokenMetadata.js";
import { getTokenAllowance } from "./actions/token/getTokenAllowance.js";

import { getAssetTransfers } from "./actions/transfers/getAssetTransfers.js";
import { getAssetTransfersPages } from "./actions/transfers/getAssetTransfersPages.js";

type Action<Params, Result> = (
  params: Params,
  options?: RequestOptions,
) => Promise<Result>;

type RpcAction<Params, Result> = (params: Params) => Promise<Result>;

type PagesAction<Params, Result> = (
  params: Params,
  options?: PaginateOptions,
) => AsyncGenerator<Result, void, undefined>;

/** The namespaced Data API actions attached by the {@link dataActions} decorator. */
export type DataActions = {
  portfolio: {
    getTokensByAddress: Action<
      T.GetTokensByAddressParams,
      T.GetTokensByAddressResult
    >;
    getTokenBalancesByAddress: Action<
      T.GetTokenBalancesByAddressParams,
      T.GetTokenBalancesByAddressResult
    >;
    getNftsByAddress: Action<
      T.GetNftsByAddressParams,
      T.GetNftsByAddressResult
    >;
    getNftContractsByAddress: Action<
      T.GetNftContractsByAddressParams,
      T.GetNftContractsByAddressResult
    >;
    getNftsByAddressPages: PagesAction<
      T.GetNftsByAddressParams,
      T.GetNftsByAddressResult
    >;
    getNftContractsByAddressPages: PagesAction<
      T.GetNftContractsByAddressParams,
      T.GetNftContractsByAddressResult
    >;
  };
  prices: {
    getTokenPricesBySymbol: Action<
      T.GetTokenPricesBySymbolParams,
      T.GetTokenPricesBySymbolResult
    >;
    getTokenPricesByAddress: Action<
      T.GetTokenPricesByAddressParams,
      T.GetTokenPricesByAddressResult
    >;
    getHistoricalTokenPrices: Action<
      T.GetHistoricalTokenPricesParams,
      T.GetHistoricalTokenPricesResult
    >;
  };
  nft: {
    getNftsForOwner: Action<T.GetNftsForOwnerParams, T.GetNftsForOwnerResult>;
    getNftsForContract: Action<
      T.GetNftsForContractParams,
      T.GetNftsForContractResult
    >;
    getNftsForCollection: Action<
      T.GetNftsForCollectionParams,
      T.GetNftsForCollectionResult
    >;
    getNftMetadata: Action<T.GetNftMetadataParams, T.GetNftMetadataResult>;
    getNftMetadataBatch: Action<
      T.GetNftMetadataBatchParams,
      T.GetNftMetadataBatchResult
    >;
    getContractMetadata: Action<
      T.GetContractMetadataParams,
      T.GetContractMetadataResult
    >;
    getContractMetadataBatch: Action<
      T.GetContractMetadataBatchParams,
      T.GetContractMetadataBatchResult
    >;
    getCollectionMetadata: Action<
      T.GetCollectionMetadataParams,
      T.GetCollectionMetadataResult
    >;
    getContractsForOwner: Action<
      T.GetContractsForOwnerParams,
      T.GetContractsForOwnerResult
    >;
    getCollectionsForOwner: Action<
      T.GetCollectionsForOwnerParams,
      T.GetCollectionsForOwnerResult
    >;
    getOwnersForNft: Action<T.GetOwnersForNftParams, T.GetOwnersForNftResult>;
    getOwnersForContract: Action<
      T.GetOwnersForContractParams,
      T.GetOwnersForContractResult
    >;
    getNftSales: Action<T.GetNftSalesParams, T.GetNftSalesResult>;
    getFloorPrice: Action<T.GetFloorPriceParams, T.GetFloorPriceResult>;
    searchContractMetadata: Action<
      T.SearchContractMetadataParams,
      T.SearchContractMetadataResult
    >;
    getSpamContracts: Action<
      T.GetSpamContractsParams,
      T.GetSpamContractsResult
    >;
    isSpamContract: Action<T.IsSpamContractParams, T.IsSpamContractResult>;
    isAirdropNft: Action<T.IsAirdropNftParams, T.IsAirdropNftResult>;
    isHolderOfContract: Action<
      T.IsHolderOfContractParams,
      T.IsHolderOfContractResult
    >;
    computeRarity: Action<T.ComputeRarityParams, T.ComputeRarityResult>;
    summarizeNftAttributes: Action<
      T.SummarizeNftAttributesParams,
      T.SummarizeNftAttributesResult
    >;
    getNftsForOwnerPages: PagesAction<
      T.GetNftsForOwnerParams,
      T.GetNftsForOwnerResult
    >;
    getNftsForContractPages: PagesAction<
      T.GetNftsForContractParams,
      T.GetNftsForContractResult
    >;
    getNftsForCollectionPages: PagesAction<
      T.GetNftsForCollectionParams,
      T.GetNftsForCollectionResult
    >;
    getContractsForOwnerPages: PagesAction<
      T.GetContractsForOwnerParams,
      T.GetContractsForOwnerResult
    >;
    getCollectionsForOwnerPages: PagesAction<
      T.GetCollectionsForOwnerParams,
      T.GetCollectionsForOwnerResult
    >;
    getNftSalesPages: PagesAction<T.GetNftSalesParams, T.GetNftSalesResult>;
  };
  token: {
    getTokenBalances: RpcAction<
      T.GetTokenBalancesParams,
      T.GetTokenBalancesResult
    >;
    getTokenMetadata: RpcAction<
      T.GetTokenMetadataParams,
      T.GetTokenMetadataResult
    >;
    getTokenAllowance: RpcAction<
      T.GetTokenAllowanceParams,
      T.GetTokenAllowanceResult
    >;
  };
  transfers: {
    getAssetTransfers: RpcAction<
      T.GetAssetTransfersParams,
      T.GetAssetTransfersResult
    >;
    getAssetTransfersPages: PagesAction<
      T.GetAssetTransfersParams,
      T.GetAssetTransfersResult
    >;
  };
};

/**
 * Builds the namespaced Data API actions over a core data client. Used by
 * {@link createDataClient}; ecosystem adapters (e.g. the parked viem adapter
 * in src/viem/) construct a core client and delegate here, so every surface
 * shares one implementation.
 *
 * @param {DataClient} client The core client (config + default network)
 * @returns {DataActions} The namespaced Data API actions
 */
export function dataActions(client: DataClient): DataActions {
  return {
    portfolio: {
      getTokensByAddress: (params, options) =>
        getTokensByAddress(client, params, options),
      getTokenBalancesByAddress: (params, options) =>
        getTokenBalancesByAddress(client, params, options),
      getNftsByAddress: (params, options) =>
        getNftsByAddress(client, params, options),
      getNftContractsByAddress: (params, options) =>
        getNftContractsByAddress(client, params, options),
      getNftsByAddressPages: (params, options) =>
        getNftsByAddressPages(client, params, options),
      getNftContractsByAddressPages: (params, options) =>
        getNftContractsByAddressPages(client, params, options),
    },
    prices: {
      getTokenPricesBySymbol: (params, options) =>
        getTokenPricesBySymbol(client, params, options),
      getTokenPricesByAddress: (params, options) =>
        getTokenPricesByAddress(client, params, options),
      getHistoricalTokenPrices: (params, options) =>
        getHistoricalTokenPrices(client, params, options),
    },
    nft: {
      getNftsForOwner: (params, options) =>
        getNftsForOwner(client, params, options),
      getNftsForContract: (params, options) =>
        getNftsForContract(client, params, options),
      getNftsForCollection: (params, options) =>
        getNftsForCollection(client, params, options),
      getNftMetadata: (params, options) =>
        getNftMetadata(client, params, options),
      getNftMetadataBatch: (params, options) =>
        getNftMetadataBatch(client, params, options),
      getContractMetadata: (params, options) =>
        getContractMetadata(client, params, options),
      getContractMetadataBatch: (params, options) =>
        getContractMetadataBatch(client, params, options),
      getCollectionMetadata: (params, options) =>
        getCollectionMetadata(client, params, options),
      getContractsForOwner: (params, options) =>
        getContractsForOwner(client, params, options),
      getCollectionsForOwner: (params, options) =>
        getCollectionsForOwner(client, params, options),
      getOwnersForNft: (params, options) =>
        getOwnersForNft(client, params, options),
      getOwnersForContract: (params, options) =>
        getOwnersForContract(client, params, options),
      getNftSales: (params, options) => getNftSales(client, params, options),
      getFloorPrice: (params, options) =>
        getFloorPrice(client, params, options),
      searchContractMetadata: (params, options) =>
        searchContractMetadata(client, params, options),
      getSpamContracts: (params, options) =>
        getSpamContracts(client, params, options),
      isSpamContract: (params, options) =>
        isSpamContract(client, params, options),
      isAirdropNft: (params, options) => isAirdropNft(client, params, options),
      isHolderOfContract: (params, options) =>
        isHolderOfContract(client, params, options),
      computeRarity: (params, options) =>
        computeRarity(client, params, options),
      summarizeNftAttributes: (params, options) =>
        summarizeNftAttributes(client, params, options),
      getNftsForOwnerPages: (params, options) =>
        getNftsForOwnerPages(client, params, options),
      getNftsForContractPages: (params, options) =>
        getNftsForContractPages(client, params, options),
      getNftsForCollectionPages: (params, options) =>
        getNftsForCollectionPages(client, params, options),
      getContractsForOwnerPages: (params, options) =>
        getContractsForOwnerPages(client, params, options),
      getCollectionsForOwnerPages: (params, options) =>
        getCollectionsForOwnerPages(client, params, options),
      getNftSalesPages: (params, options) =>
        getNftSalesPages(client, params, options),
    },
    token: {
      getTokenBalances: (params) => getTokenBalances(client, params),
      getTokenMetadata: (params) => getTokenMetadata(client, params),
      getTokenAllowance: (params) => getTokenAllowance(client, params),
    },
    transfers: {
      getAssetTransfers: (params) => getAssetTransfers(client, params),
      getAssetTransfersPages: (params, options) =>
        getAssetTransfersPages(client, params, options),
    },
  };
}
