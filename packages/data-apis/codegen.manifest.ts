import type { CodegenManifest } from "@alchemy/api-codegen";

// The hand-maintained overlay mapping spec operations to this package's
// generated internals (src/generated/). Validated against the committed spec
// snapshots on every `pnpm generate` — referencing a renamed/removed spec
// operation is a hard error. Public naming and pagination semantics stay
// human decisions; everything type-shaped is generated.
export default {
  rest: [
    {
      spec: "portfolio",
      schemaTypeName: "PortfolioRestSchema",
      // Spec path: POST /{apiKey}/assets/tokens/by-address. Runtime auth is
      // header-based against https://api.g.alchemy.com/data/v1.
      pathRules: { stripApiKeySegment: true },
      operations: [
        {
          operationId: "get-tokens-by-address",
          exportBaseName: "GetTokensByAddress",
        },
      ],
    },
    {
      spec: "prices",
      schemaTypeName: "PricesRestSchema",
      // Spec paths: /{apiKey}/tokens/by-symbol etc. Runtime auth is
      // header-based against https://api.g.alchemy.com/prices/v1.
      pathRules: { stripApiKeySegment: true },
      operations: [
        {
          operationId: "get-token-prices-by-symbol",
          exportBaseName: "GetTokenPricesBySymbol",
          emitQueryType: true,
        },
        {
          operationId: "get-token-prices-by-address",
          exportBaseName: "GetTokenPricesByAddress",
        },
        {
          operationId: "get-historical-token-prices",
          exportBaseName: "GetHistoricalTokenPrices",
        },
      ],
    },
    {
      spec: "nft",
      schemaTypeName: "NftRestSchema",
      // Spec path: GET /v3/{apiKey}/getNFTsForOwner. Runtime base URL is
      // https://{network}.g.alchemy.com/nft/v3, so /v3 is stripped too.
      pathRules: { stripApiKeySegment: true, stripPrefix: "/v3" },
      operations: [
        {
          operationId: "getNFTsForOwner-v3",
          exportBaseName: "GetNftsForOwner",
          pagination: {
            pageParam: "pageKey",
            responseCursorField: "pageKey",
            itemsField: "ownedNfts",
          },
        },
      ],
    },
  ],
  rpc: [
    {
      spec: "transfers",
      schemaTypeName: "TransfersRpcSchema",
      methods: [
        {
          method: "alchemy_getAssetTransfers",
          exportBaseName: "AlchemyGetAssetTransfers",
          pagination: {
            pageParam: "assetTransferParams.pageKey",
            responseCursorField: "pageKey",
            itemsField: "transfers",
          },
        },
      ],
    },
    {
      spec: "token",
      schemaTypeName: "TokenRpcSchema",
      methods: [
        {
          method: "alchemy_getTokenBalances",
          exportBaseName: "AlchemyGetTokenBalances",
        },
        {
          method: "alchemy_getTokenMetadata",
          exportBaseName: "AlchemyGetTokenMetadata",
        },
        {
          method: "alchemy_getTokenAllowance",
          exportBaseName: "AlchemyGetTokenAllowance",
        },
      ],
    },
  ],
} satisfies CodegenManifest;
