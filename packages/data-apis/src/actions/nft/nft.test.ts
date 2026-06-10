import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDataClient } from "../../client.js";

const fetchMock = vi.fn();

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const makeClient = () =>
  createDataClient({ apiKey: "test-key", network: "eth-mainnet" });

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () => jsonResponse({}));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const NFT_BASE = "https://eth-mainnet.g.alchemy.com/nft/v3";

describe("nft namespace routing", () => {
  // [method call, expected URL] — wire-level checks for the patterned GETs
  const cases: Array<
    [string, (c: ReturnType<typeof makeClient>) => Promise<unknown>, string]
  > = [
    [
      "getNftsForContract",
      (c) => c.nft.getNftsForContract({ contractAddress: "0xc" }),
      `${NFT_BASE}/getNFTsForContract?contractAddress=0xc`,
    ],
    [
      "getNftsForCollection",
      (c) => c.nft.getNftsForCollection({ collectionSlug: "slug" }),
      `${NFT_BASE}/getNFTsForCollection?collectionSlug=slug`,
    ],
    [
      "getNftMetadata",
      (c) => c.nft.getNftMetadata({ contractAddress: "0xc", tokenId: "1" }),
      `${NFT_BASE}/getNFTMetadata?contractAddress=0xc&tokenId=1`,
    ],
    [
      "getContractMetadata",
      (c) => c.nft.getContractMetadata({ contractAddress: "0xc" }),
      `${NFT_BASE}/getContractMetadata?contractAddress=0xc`,
    ],
    [
      "getCollectionMetadata",
      (c) => c.nft.getCollectionMetadata({ collectionSlug: "slug" }),
      `${NFT_BASE}/getCollectionMetadata?collectionSlug=slug`,
    ],
    [
      "getOwnersForNft",
      (c) => c.nft.getOwnersForNft({ contractAddress: "0xc", tokenId: "1" }),
      `${NFT_BASE}/getOwnersForNFT?contractAddress=0xc&tokenId=1`,
    ],
    [
      "getOwnersForContract",
      (c) => c.nft.getOwnersForContract({ contractAddress: "0xc" }),
      `${NFT_BASE}/getOwnersForContract?contractAddress=0xc`,
    ],
    [
      "getNftSales",
      (c) => c.nft.getNftSales({ contractAddress: "0xc", limit: 5 }),
      `${NFT_BASE}/getNFTSales?contractAddress=0xc&limit=5`,
    ],
    [
      "getFloorPrice",
      (c) => c.nft.getFloorPrice({ contractAddress: "0xc" }),
      `${NFT_BASE}/getFloorPrice?contractAddress=0xc`,
    ],
    [
      "searchContractMetadata",
      (c) => c.nft.searchContractMetadata({ query: "apes" }),
      `${NFT_BASE}/searchContractMetadata?query=apes`,
    ],
    [
      "getSpamContracts",
      (c) => c.nft.getSpamContracts(),
      `${NFT_BASE}/getSpamContracts`,
    ],
    [
      "isSpamContract",
      (c) => c.nft.isSpamContract({ contractAddress: "0xc" }),
      `${NFT_BASE}/isSpamContract?contractAddress=0xc`,
    ],
    [
      "isAirdropNft",
      (c) => c.nft.isAirdropNft({ contractAddress: "0xc", tokenId: "1" }),
      `${NFT_BASE}/isAirdropNFT?contractAddress=0xc&tokenId=1`,
    ],
    [
      "isHolderOfContract",
      (c) =>
        c.nft.isHolderOfContract({ wallet: "0xw", contractAddress: "0xc" }),
      `${NFT_BASE}/isHolderOfContract?wallet=0xw&contractAddress=0xc`,
    ],
    [
      "computeRarity",
      (c) => c.nft.computeRarity({ contractAddress: "0xc", tokenId: "1" }),
      `${NFT_BASE}/computeRarity?contractAddress=0xc&tokenId=1`,
    ],
    [
      "summarizeNftAttributes",
      (c) => c.nft.summarizeNftAttributes({ contractAddress: "0xc" }),
      `${NFT_BASE}/summarizeNFTAttributes?contractAddress=0xc`,
    ],
  ];

  it.each(cases)("%s hits the expected URL", async (_name, call, expected) => {
    await call(makeClient());
    expect(String(fetchMock.mock.calls[0]![0])).toBe(expected);
    expect(fetchMock.mock.calls[0]![1].method).toBe("GET");
  });

  it("re-brackets filter keys for owner-scoped listings", async () => {
    const data = makeClient();
    await data.nft.getContractsForOwner({
      owner: "0xo",
      excludeFilters: ["SPAM"],
      includeFilters: ["AIRDROPS"],
    });
    const url = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(url.pathname.endsWith("/getContractsForOwner")).toBe(true);
    expect(url.searchParams.getAll("excludeFilters[]")).toEqual(["SPAM"]);
    expect(url.searchParams.getAll("includeFilters[]")).toEqual(["AIRDROPS"]);

    await data.nft.getCollectionsForOwner({
      owner: "0xo",
      excludeFilters: ["SPAM"],
    });
    const url2 = new URL(String(fetchMock.mock.calls[1]![0]));
    expect(url2.searchParams.getAll("excludeFilters[]")).toEqual(["SPAM"]);
  });

  it("posts batch metadata bodies", async () => {
    const data = makeClient();
    await data.nft.getNftMetadataBatch({
      tokens: [{ contractAddress: "0xc", tokenId: "1" }],
    });
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      `${NFT_BASE}/getNFTMetadataBatch`,
    );
    expect(fetchMock.mock.calls[0]![1].method).toBe("POST");
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({
      tokens: [{ contractAddress: "0xc", tokenId: "1" }],
    });

    await data.nft.getContractMetadataBatch({
      contractAddresses: ["0xc1", "0xc2"],
    });
    expect(String(fetchMock.mock.calls[1]![0])).toBe(
      `${NFT_BASE}/getContractMetadataBatch`,
    );
    expect(JSON.parse(fetchMock.mock.calls[1]![1].body)).toEqual({
      contractAddresses: ["0xc1", "0xc2"],
    });
  });

  it("honors per-request network overrides", async () => {
    const data = makeClient();
    await data.nft.getContractMetadata({
      contractAddress: "0xc",
      network: "base-mainnet",
    });
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      "https://base-mainnet.g.alchemy.com/nft/v3/getContractMetadata?contractAddress=0xc",
    );
  });
});
