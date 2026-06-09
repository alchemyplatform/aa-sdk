import type { NetworkInput } from "@alchemy/common";

// NOTE(mvp): these param/result types are hand-written against the docs specs
// to prove the architecture. The production plan generates them from the docs
// repo's bundled OpenAPI/OpenRPC output (see data-sdk-scope-plan.md), with
// reviewed, semver-bearing public names aliasing generated internals.

/** An address paired with the networks to query it on. */
export interface PortfolioAddressEntry {
  address: string;
  /** Networks to query; accepts viem Chains, Alchemy slugs, or CAIP-2 ids. */
  networks: NetworkInput[];
}

export interface GetTokensByAddressParams {
  addresses: PortfolioAddressEntry[];
  withMetadata?: boolean;
  withPrices?: boolean;
  includeNativeTokens?: boolean;
  includeErc20Tokens?: boolean;
}

export interface PortfolioToken {
  address: string;
  network: string;
  tokenAddress: string | null;
  tokenBalance: string;
  tokenMetadata?: {
    name?: string | null;
    symbol?: string | null;
    decimals?: number | null;
    logo?: string | null;
  };
  tokenPrices?: Array<{
    currency: string;
    value: string;
    lastUpdatedAt: string;
  }>;
}

export interface GetTokensByAddressResult {
  data: {
    tokens: PortfolioToken[];
    pageKey?: string;
  };
}

export interface GetNftsForOwnerParams {
  owner: string;
  /** Overrides the client-level network for this request. */
  network?: NetworkInput;
  contractAddresses?: string[];
  withMetadata?: boolean;
  pageKey?: string;
  pageSize?: number;
}

export interface GetNftsForOwnerResult {
  ownedNfts: Array<Record<string, unknown>>;
  totalCount: number;
  pageKey?: string;
  validAt?: Record<string, unknown>;
}

export interface GetAssetTransfersParams {
  /** Overrides the client-level network for this request. */
  network?: NetworkInput;
  fromBlock?: string;
  toBlock?: string;
  fromAddress?: string;
  toAddress?: string;
  excludeZeroValue?: boolean;
  category: Array<
    "external" | "internal" | "erc20" | "erc721" | "erc1155" | "specialnft"
  >;
  contractAddresses?: string[];
  order?: "asc" | "desc";
  withMetadata?: boolean;
  pageKey?: string;
  maxCount?: string;
}

export interface AssetTransfer {
  category: string;
  blockNum: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  hash: string;
  uniqueId: string;
  rawContract: {
    value: string | null;
    address: string | null;
    decimal: string | null;
  };
  metadata?: { blockTimestamp: string };
}

export interface GetAssetTransfersResult {
  transfers: AssetTransfer[];
  pageKey?: string;
}
