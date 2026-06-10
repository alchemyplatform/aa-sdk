import type { NetworkInput } from "@alchemy/common";
import type {
  GetNftsForOwnerQuery,
  GetNftsForOwnerResponse,
} from "./generated/rest/nft.schema.js";
import type {
  GetTokensByAddressBody,
  GetTokensByAddressResponse,
} from "./generated/rest/portfolio.schema.js";
import type {
  AlchemyGetAssetTransfersParams,
  AlchemyGetAssetTransfersResult,
} from "./generated/rpc/transfers.js";

// Public param/result types are hand-reviewed aliases over generated
// internals (src/generated/, produced by @alchemy/api-codegen from the docs
// repo's bundled OpenAPI/OpenRPC specs). Generated names are never
// re-exported directly: every public-surface change is a deliberate edit
// here, even when the underlying spec moves.

/** An address paired with the networks to query it on. */
export interface PortfolioAddressEntry {
  address: string;
  /** Networks to query; accepts viem Chains, Alchemy slugs, or CAIP-2 ids. */
  networks: NetworkInput[];
}

/**
 * Generated request body with the wire-format `addresses` (plain string
 * networks) replaced by the SDK's three-format {@link PortfolioAddressEntry}.
 */
export type GetTokensByAddressParams = Omit<
  GetTokensByAddressBody,
  "addresses"
> & {
  addresses: PortfolioAddressEntry[];
};

export type GetTokensByAddressResult = GetTokensByAddressResponse;

export type PortfolioToken = NonNullable<
  GetTokensByAddressResponse["data"]["tokens"]
>[number];

/**
 * Generated query params plus the SDK's network override; the wire's
 * bracketed `contractAddresses[]` key is replaced with a plain array (the
 * action serializes it back to the bracketed form).
 */
export type GetNftsForOwnerParams = Omit<
  GetNftsForOwnerQuery,
  "contractAddresses[]"
> & {
  /** Overrides the client-level network for this request. */
  network?: NetworkInput;
  /** Contract addresses to filter by (max 45). */
  contractAddresses?: string[];
};

export type GetNftsForOwnerResult = GetNftsForOwnerResponse;

/** Generated RPC params plus the SDK's network override. */
export type GetAssetTransfersParams = AlchemyGetAssetTransfersParams & {
  /** Overrides the client-level network for this request. */
  network?: NetworkInput;
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
