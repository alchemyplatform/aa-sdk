import type { RestRequestSchema } from "@alchemy/common";
import type {
  GetNftsForOwnerResult,
  GetTokensByAddressResult,
} from "../types.js";

// NOTE(mvp): hand-written RestRequestSchema entries; the production plan
// generates these from the docs repo's bundled OpenAPI specs via
// `pnpm generate:sdk` (openapi-typescript), keyed by the SDK manifest.

/** Routes served by the global Data API (https://api.g.alchemy.com/data/v1). */
export type PortfolioRestSchema = readonly [
  {
    Route: "assets/tokens/by-address";
    Method: "POST";
    Body: {
      addresses: Array<{ address: string; networks: string[] }>;
      withMetadata?: boolean;
      withPrices?: boolean;
      includeNativeTokens?: boolean;
      includeErc20Tokens?: boolean;
    };
    Response: GetTokensByAddressResult;
  },
];

/** Routes served by the network-scoped NFT API ({network}.g.alchemy.com/nft/v3). */
export type NftRestSchema = readonly [
  {
    Route: "getNFTsForOwner";
    Method: "GET";
    Body?: undefined;
    Response: GetNftsForOwnerResult;
  },
];

// Compile-time check that the schemas satisfy the shared constraint.
type _AssertPortfolio = PortfolioRestSchema extends RestRequestSchema
  ? true
  : never;
type _AssertNft = NftRestSchema extends RestRequestSchema ? true : never;
export type _SchemaAssertions = [_AssertPortfolio, _AssertNft];
