import type { CodegenManifest } from "@alchemy/api-codegen";

// The hand-maintained overlay mapping spec operations to this package's
// generated internals (src/generated/). Validated against the committed spec
// snapshots on every `pnpm generate` — referencing a renamed/removed/
// deprecated spec operation is a hard error, and pagination metadata is
// checked against request/response schemas. Public naming and pagination
// semantics stay human decisions; everything type-shaped is generated.
//
// Deliberately excluded: NFT v2 legacy duplicates, and the v3 mutation
// operations (invalidateContract-v3, reportSpam-v3, refreshNftMetadata-v3)
// per the data SDK scope plan.
export default {
  rest: [
    {
      spec: "portfolio",
      schemaTypeName: "PortfolioRestSchema",
      // Spec paths: POST /{apiKey}/assets/... Runtime auth is header-based
      // against https://api.g.alchemy.com/data/v1.
      pathRules: { stripApiKeySegment: true },
      operations: [
        {
          operationId: "get-tokens-by-address",
          exportBaseName: "GetTokensByAddress",
        },
        {
          operationId: "get-token-balances-by-address",
          exportBaseName: "GetTokenBalancesByAddress",
        },
        {
          operationId: "get-nfts-by-address",
          exportBaseName: "GetNftsByAddress",
          pagination: {
            pageParam: "pageKey",
            responseCursorField: "data.pageKey",
            itemsField: "data.ownedNfts",
          },
        },
        {
          operationId: "get-nft-contracts-by-address",
          exportBaseName: "GetNftContractsByAddress",
          pagination: {
            pageParam: "pageKey",
            responseCursorField: "data.pageKey",
            itemsField: "data.contracts",
          },
        },
      ],
    },
    {
      spec: "prices",
      schemaTypeName: "PricesRestSchema",
      // Spec paths: /{apiKey}/tokens/... Runtime auth is header-based
      // against https://api.g.alchemy.com/prices/v1.
      pathRules: { stripApiKeySegment: true },
      operations: [
        {
          operationId: "get-token-prices-by-symbol",
          exportBaseName: "GetTokenPricesBySymbol",
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
      // Spec paths: /v3/{apiKey}/<op>. Runtime base URL is
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
        {
          operationId: "getNFTsForContract-v3",
          exportBaseName: "GetNftsForContract",
          pagination: {
            pageParam: "startToken",
            responseCursorField: "pageKey",
            itemsField: "nfts",
          },
        },
        {
          operationId: "getNFTsForCollection-v3",
          exportBaseName: "GetNftsForCollection",
          pagination: {
            pageParam: "startToken",
            responseCursorField: "nextToken",
            itemsField: "nfts",
          },
        },
        {
          operationId: "getNFTMetadata-v3",
          exportBaseName: "GetNftMetadata",
        },
        {
          operationId: "getNFTMetadataBatch-v3",
          exportBaseName: "GetNftMetadataBatch",
        },
        {
          operationId: "getContractMetadata-v3",
          exportBaseName: "GetContractMetadata",
        },
        {
          operationId: "getContractMetadataBatch-v3",
          exportBaseName: "GetContractMetadataBatch",
        },
        {
          operationId: "getCollectionMetadata-v3",
          exportBaseName: "GetCollectionMetadata",
        },
        {
          operationId: "getContractsForOwner-v3",
          exportBaseName: "GetContractsForOwner",
          pagination: {
            pageParam: "pageKey",
            responseCursorField: "pageKey",
            itemsField: "contracts",
          },
        },
        {
          operationId: "getCollectionsForOwner-v3",
          exportBaseName: "GetCollectionsForOwner",
          pagination: {
            pageParam: "pageKey",
            responseCursorField: "pageKey",
            itemsField: "collections",
          },
        },
        {
          operationId: "getOwnersForNFT-v3",
          exportBaseName: "GetOwnersForNft",
        },
        {
          // Note: request takes pageKey but the response declares no cursor
          // field, so no pagination metadata (and no Pages companion).
          operationId: "getOwnersForContract-v3",
          exportBaseName: "GetOwnersForContract",
        },
        {
          operationId: "getNFTSales-v3",
          exportBaseName: "GetNftSales",
          pagination: {
            pageParam: "pageKey",
            responseCursorField: "pageKey",
            itemsField: "nftSales",
          },
        },
        {
          operationId: "getFloorPrice-v3",
          exportBaseName: "GetFloorPrice",
        },
        {
          operationId: "searchContractMetadata-v3",
          exportBaseName: "SearchContractMetadata",
        },
        {
          operationId: "getSpamContracts-v3",
          exportBaseName: "GetSpamContracts",
        },
        {
          operationId: "isSpamContract-v3",
          exportBaseName: "IsSpamContract",
        },
        {
          operationId: "isAirdropNFT-v3",
          exportBaseName: "IsAirdropNft",
        },
        {
          operationId: "isHolderOfContract-v3",
          exportBaseName: "IsHolderOfContract",
        },
        {
          operationId: "computeRarity-v3",
          exportBaseName: "ComputeRarity",
        },
        {
          operationId: "summarizeNFTAttributes-v3",
          exportBaseName: "SummarizeNftAttributes",
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
          // No pagination metadata: the docs spec omits pageKey from the
          // result schema even though the live API returns one when
          // paginating — a spec gap to raise with the docs team. Callers can
          // still page manually via options.pageKey.
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
