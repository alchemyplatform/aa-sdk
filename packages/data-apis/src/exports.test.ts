import { describe, expect, it } from "vitest";
import * as packageExports from "./index.js";

describe("package export boundary", () => {
  it("exposes exactly the intended runtime exports", () => {
    expect(Object.keys(packageExports).sort()).toEqual(
      [
        "VERSION",
        "computeRarity",
        "createDataClient",
        "getAssetTransfers",
        "getAssetTransfersPages",
        "getCollectionMetadata",
        "getCollectionsForOwner",
        "getCollectionsForOwnerPages",
        "getContractMetadata",
        "getContractMetadataBatch",
        "getContractsForOwner",
        "getContractsForOwnerPages",
        "getFloorPrice",
        "getHistoricalTokenPrices",
        "getNftContractsByAddress",
        "getNftContractsByAddressPages",
        "getNftMetadata",
        "getNftMetadataBatch",
        "getNftSales",
        "getNftSalesPages",
        "getNftsByAddress",
        "getNftsByAddressPages",
        "getNftsForCollection",
        "getNftsForCollectionPages",
        "getNftsForContract",
        "getNftsForContractPages",
        "getNftsForOwner",
        "getNftsForOwnerPages",
        "getOwnersForContract",
        "getOwnersForNft",
        "getSpamContracts",
        "getTokenAllowance",
        "getTokenBalances",
        "getTokenBalancesByAddress",
        "getTokenMetadata",
        "getTokenPricesByAddress",
        "getTokenPricesBySymbol",
        "getTokensByAddress",
        "isAirdropNft",
        "isHolderOfContract",
        "isSpamContract",
        "searchContractMetadata",
        "summarizeNftAttributes",
      ].sort(),
    );
  });

  it("does not re-export the generated internals barrel", () => {
    expect(Object.keys(packageExports)).not.toContain("operations");
    expect(Object.keys(packageExports)).not.toContain("paths");
  });
});
