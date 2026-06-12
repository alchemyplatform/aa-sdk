import type { AlchemyNetwork } from "@alchemy/common/core";
import type {
  ComputeRarityQuery,
  ComputeRarityResponse,
  GetCollectionMetadataQuery,
  GetCollectionMetadataResponse,
  GetCollectionsForOwnerQuery,
  GetCollectionsForOwnerResponse,
  GetContractMetadataBatchBody,
  GetContractMetadataBatchResponse,
  GetContractMetadataQuery,
  GetContractMetadataResponse,
  GetContractsForOwnerQuery,
  GetContractsForOwnerResponse,
  GetFloorPriceQuery,
  GetFloorPriceResponse,
  GetNftMetadataBatchBody,
  GetNftMetadataBatchResponse,
  GetNftMetadataQuery,
  GetNftMetadataResponse,
  GetNftSalesQuery,
  GetNftSalesResponse,
  GetNftsForCollectionQuery,
  GetNftsForCollectionResponse,
  GetNftsForContractQuery,
  GetNftsForContractResponse,
  GetNftsForOwnerQuery,
  GetNftsForOwnerResponse,
  GetOwnersForContractQuery,
  GetOwnersForContractResponse,
  GetOwnersForNftQuery,
  GetOwnersForNftResponse,
  GetSpamContractsResponse,
  IsAirdropNftQuery,
  IsAirdropNftResponse,
  IsHolderOfContractQuery,
  IsHolderOfContractResponse,
  IsSpamContractQuery,
  IsSpamContractResponse,
  SearchContractMetadataQuery,
  SearchContractMetadataResponse,
  SummarizeNftAttributesQuery,
  SummarizeNftAttributesResponse,
} from "./generated/rest/nft.schema.js";
import type {
  GetNftContractsByAddressBody,
  GetNftContractsByAddressResponse,
  GetNftsByAddressBody,
  GetNftsByAddressResponse,
  GetTokenBalancesByAddressBody,
  GetTokenBalancesByAddressResponse,
  GetTokensByAddressBody,
  GetTokensByAddressResponse,
} from "./generated/rest/portfolio.schema.js";
import type {
  GetHistoricalTokenPricesBody,
  GetHistoricalTokenPricesResponse,
  GetTokenPricesByAddressBody,
  GetTokenPricesByAddressResponse,
  GetTokenPricesBySymbolQuery,
  GetTokenPricesBySymbolResponse,
} from "./generated/rest/prices.schema.js";
import type {
  AlchemyGetTokenAllowanceParams,
  AlchemyGetTokenAllowanceResult,
  AlchemyGetTokenBalancesAddressParam,
  AlchemyGetTokenBalancesOptionsParam,
  AlchemyGetTokenBalancesResult,
  AlchemyGetTokenBalancesTokenSpecParam,
  AlchemyGetTokenMetadataParams,
  AlchemyGetTokenMetadataResult,
} from "./generated/rpc/token.js";
import type {
  AlchemyGetAssetTransfersParams,
  AlchemyGetAssetTransfersResult,
} from "./generated/rpc/transfers.js";

// Public param/result types are hand-reviewed aliases over generated
// internals (src/generated/, produced by @alchemy/api-codegen from the docs
// repo's bundled OpenAPI/OpenRPC specs). Generated names are never
// re-exported directly: every public-surface change is a deliberate edit
// here, even when the underlying spec moves.

/** Renames wire keys like "contractAddresses[]" to plain names; actions map them back. */
type Unbracket<T> = {
  [K in keyof T as K extends `${infer Base}[]` ? Base : K]: T[K];
};

/** Query params of a network-scoped method, plus the SDK's network override. */
type NetworkScoped<T> = Unbracket<T> & {
  /** Overrides the client-level network for this request. */
  network?: AlchemyNetwork;
};

/** Distributes over a union, replacing wire `network: string` with AlchemyNetwork. */
type WithAlchemyNetwork<T> = T extends { network: string }
  ? Omit<T, "network"> & { network: AlchemyNetwork }
  : T;

// ─── Portfolio (REST, global, multi-network) ────────────────────────────────

/** An address paired with the networks to query it on. */
export interface PortfolioAddressEntry {
  address: string;
  /** Networks to query; accepts Alchemy slugs or CAIP-2 ids. */
  networks: AlchemyNetwork[];
}

/**
 * Replaces each wire-format address entry's `networks` (slug strings — an
 * enum in some specs, deliberately widened here to support the SDK's
 * escape-hatch slugs) with the SDK's three-format AlchemyNetwork, preserving
 * any other per-entry fields the operation defines (e.g. per-address
 * include/exclude filters).
 */
type PortfolioParams<Body extends { addresses: readonly unknown[] }> = Omit<
  Body,
  "addresses"
> & {
  addresses: Array<
    Omit<Body["addresses"][number], "networks"> & {
      /** Networks to query; accepts Alchemy slugs or CAIP-2 ids. */
      networks: AlchemyNetwork[];
    }
  >;
};

export type GetTokensByAddressParams = PortfolioParams<GetTokensByAddressBody>;
export type GetTokensByAddressResult = GetTokensByAddressResponse;
export type PortfolioToken = NonNullable<
  GetTokensByAddressResponse["data"]["tokens"]
>[number];

export type GetTokenBalancesByAddressParams =
  PortfolioParams<GetTokenBalancesByAddressBody>;
export type GetTokenBalancesByAddressResult = GetTokenBalancesByAddressResponse;

export type GetNftsByAddressParams = PortfolioParams<GetNftsByAddressBody>;
export type GetNftsByAddressResult = GetNftsByAddressResponse;

export type GetNftContractsByAddressParams =
  PortfolioParams<GetNftContractsByAddressBody>;
export type GetNftContractsByAddressResult = GetNftContractsByAddressResponse;

// ─── Prices (REST, global) ───────────────────────────────────────────────────

/** Chain-agnostic: token symbols only, no network involved. */
export type GetTokenPricesBySymbolParams = GetTokenPricesBySymbolQuery;
export type GetTokenPricesBySymbolResult = GetTokenPricesBySymbolResponse;

/** A token address paired with the network it lives on. */
export interface PriceAddressEntry {
  address: string;
  /** Accepts an Alchemy slug or a CAIP-2 id. */
  network: AlchemyNetwork;
}

export type GetTokenPricesByAddressParams = Omit<
  GetTokenPricesByAddressBody,
  "addresses"
> & {
  addresses: PriceAddressEntry[];
};
export type GetTokenPricesByAddressResult = GetTokenPricesByAddressResponse;

export type GetHistoricalTokenPricesParams =
  WithAlchemyNetwork<GetHistoricalTokenPricesBody>;
export type GetHistoricalTokenPricesResult = GetHistoricalTokenPricesResponse;

// ─── NFT (REST, network-scoped) ──────────────────────────────────────────────

export type GetNftsForOwnerParams = NetworkScoped<GetNftsForOwnerQuery>;
export type GetNftsForOwnerResult = GetNftsForOwnerResponse;

export type GetNftsForContractParams = NetworkScoped<GetNftsForContractQuery>;
export type GetNftsForContractResult = GetNftsForContractResponse;

export type GetNftsForCollectionParams =
  NetworkScoped<GetNftsForCollectionQuery>;
export type GetNftsForCollectionResult = GetNftsForCollectionResponse;

export type GetNftMetadataParams = NetworkScoped<GetNftMetadataQuery>;
export type GetNftMetadataResult = GetNftMetadataResponse;

export type GetNftMetadataBatchParams = GetNftMetadataBatchBody & {
  /** Overrides the client-level network for this request. */
  network?: AlchemyNetwork;
};
export type GetNftMetadataBatchResult = GetNftMetadataBatchResponse;

export type GetContractMetadataParams = NetworkScoped<GetContractMetadataQuery>;
export type GetContractMetadataResult = GetContractMetadataResponse;

export type GetContractMetadataBatchParams = GetContractMetadataBatchBody & {
  /** Overrides the client-level network for this request. */
  network?: AlchemyNetwork;
};
export type GetContractMetadataBatchResult = GetContractMetadataBatchResponse;

export type GetCollectionMetadataParams =
  NetworkScoped<GetCollectionMetadataQuery>;
export type GetCollectionMetadataResult = GetCollectionMetadataResponse;

export type GetContractsForOwnerParams =
  NetworkScoped<GetContractsForOwnerQuery>;
export type GetContractsForOwnerResult = GetContractsForOwnerResponse;

export type GetCollectionsForOwnerParams =
  NetworkScoped<GetCollectionsForOwnerQuery>;
export type GetCollectionsForOwnerResult = GetCollectionsForOwnerResponse;

export type GetOwnersForNftParams = NetworkScoped<GetOwnersForNftQuery>;
export type GetOwnersForNftResult = GetOwnersForNftResponse;

export type GetOwnersForContractParams =
  NetworkScoped<GetOwnersForContractQuery>;
export type GetOwnersForContractResult = GetOwnersForContractResponse;

export type GetNftSalesParams = NetworkScoped<GetNftSalesQuery>;
export type GetNftSalesResult = GetNftSalesResponse;

export type GetFloorPriceParams = NetworkScoped<GetFloorPriceQuery>;
export type GetFloorPriceResult = GetFloorPriceResponse;

export type SearchContractMetadataParams =
  NetworkScoped<SearchContractMetadataQuery>;
export type SearchContractMetadataResult = SearchContractMetadataResponse;

export type GetSpamContractsParams = {
  /** Overrides the client-level network for this request. */
  network?: AlchemyNetwork;
};
export type GetSpamContractsResult = GetSpamContractsResponse;

export type IsSpamContractParams = NetworkScoped<IsSpamContractQuery>;
export type IsSpamContractResult = IsSpamContractResponse;

export type IsAirdropNftParams = NetworkScoped<IsAirdropNftQuery>;
export type IsAirdropNftResult = IsAirdropNftResponse;

export type IsHolderOfContractParams = NetworkScoped<IsHolderOfContractQuery>;
export type IsHolderOfContractResult = IsHolderOfContractResponse;

export type ComputeRarityParams = NetworkScoped<ComputeRarityQuery>;
export type ComputeRarityResult = ComputeRarityResponse;

export type SummarizeNftAttributesParams =
  NetworkScoped<SummarizeNftAttributesQuery>;
export type SummarizeNftAttributesResult = SummarizeNftAttributesResponse;

// ─── Token (JSON-RPC, network-scoped) ────────────────────────────────────────

export type GetTokenBalancesParams = {
  /** The address to fetch balances for. */
  address: AlchemyGetTokenBalancesAddressParam;
  /** "erc20" | "NATIVE_TOKEN" | "DEFAULT_TOKENS" or an explicit contract list. */
  tokenSpec?: AlchemyGetTokenBalancesTokenSpecParam;
  /** Paging options (pageKey/maxCount; only valid with the "erc20" spec). */
  options?: AlchemyGetTokenBalancesOptionsParam;
  /** Overrides the client-level network for this request. */
  network?: AlchemyNetwork;
};
export type GetTokenBalancesResult = AlchemyGetTokenBalancesResult;

export type GetTokenMetadataParams = {
  /** The token contract address. */
  contractAddress: AlchemyGetTokenMetadataParams;
  /** Overrides the client-level network for this request. */
  network?: AlchemyNetwork;
};
export type GetTokenMetadataResult = AlchemyGetTokenMetadataResult;

export type GetTokenAllowanceParams = AlchemyGetTokenAllowanceParams & {
  /** Overrides the client-level network for this request. */
  network?: AlchemyNetwork;
};
export type GetTokenAllowanceResult = AlchemyGetTokenAllowanceResult;

// ─── Transfers (JSON-RPC, network-scoped) ────────────────────────────────────

/** Generated RPC params plus the SDK's network override. */
export type GetAssetTransfersParams = AlchemyGetAssetTransfersParams & {
  /** Overrides the client-level network for this request. */
  network?: AlchemyNetwork;
};

/**
 * The spec result is `oneOf: ["Not Found (null)" string, object]`; the string
 * branch is a docs-spec artifact the SDK deliberately does not surface, so it
 * is collapsed away here (and in {@link DataRpcSchema}).
 */
export type GetAssetTransfersResult = Exclude<
  AlchemyGetAssetTransfersResult,
  string
>;

export type AssetTransfer = NonNullable<
  GetAssetTransfersResult["transfers"]
>[number];
