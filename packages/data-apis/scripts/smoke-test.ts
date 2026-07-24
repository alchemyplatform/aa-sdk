/**
 * Smoke test for @alchemy/data-apis — runs against the real Alchemy API.
 *
 * Usage:
 *   ALCHEMY_API_KEY=<your-key> pnpm --filter @alchemy/data-apis smoke-test
 *
 * What it covers:
 *   - createDataClient with slug and CAIP-2 network inputs
 *   - portfolio.getTokensByAddress (REST, multi-network, all three input formats)
 *   - nft.getNftsForOwner (REST, per-network, per-request override)
 *   - transfers.getAssetTransfers (JSON-RPC, per-request network override)
 */

import { mainnet } from "viem/chains";
import { alchemyTransport } from "@alchemy/common";
import { createClient } from "viem";
import { AlchemyError, createDataClient } from "../src/index.js";
import { dataActions } from "../src/viem/dataActions.js";

const API_KEY = process.env.ALCHEMY_API_KEY;
if (!API_KEY) {
  console.error("ALCHEMY_API_KEY env var is required");
  process.exit(1);
}

// Vitalik's address — publicly known, reliably has tokens, NFTs, and transfer history.
const VITALIK = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  process.stdout.write(`  ${name} ... `);
  try {
    await fn();
    console.log("\x1b[32mPASS\x1b[0m");
    passed++;
  } catch (err) {
    console.log("\x1b[31mFAIL\x1b[0m");
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new AlchemyError(`Assertion failed: ${message}`);
}

// ─── Clients ──────────────────────────────────────────────────────────────────

// Three ways to specify the default network
const clientBySlug = createDataClient({
  apiKey: API_KEY,
  network: "eth-mainnet",
});
// CAIP-2 derived from a viem chain — the core's bridge for chain objects
const clientByChain = createDataClient({
  apiKey: API_KEY,
  network: `eip155:${mainnet.id}`,
});
const clientByCaip2 = createDataClient({
  apiKey: API_KEY,
  network: "eip155:1",
});

// Parked viem adapter: bring-your-own viem client (post-v1 /viem surface)
const rawViemClient = createClient({
  chain: mainnet,
  transport: alchemyTransport({ apiKey: API_KEY }),
}).extend(dataActions);

// ─── Tests ────────────────────────────────────────────────────────────────────

console.log("\n\x1b[1mportfolio.getTokensByAddress\x1b[0m");

await test("single network (slug)", async () => {
  const result = await clientBySlug.portfolio.getTokensByAddress({
    addresses: [{ address: VITALIK, networks: ["eth-mainnet"] }],
    withMetadata: true,
    includeNativeTokens: true,
  });
  assert(
    Array.isArray(result.data.tokens),
    "result.data.tokens should be an array",
  );
  assert((result.data.tokens ?? []).length > 0, "expected at least one token");
});

await test("multi-network: slugs + CAIP-2 in one call", async () => {
  const result = await clientBySlug.portfolio.getTokensByAddress({
    addresses: [
      {
        address: VITALIK,
        networks: [
          "eth-mainnet", // Alchemy slug
          "base-mainnet", // Alchemy slug
          "eip155:137", // CAIP-2 (Polygon)
        ],
      },
    ],
    withMetadata: false,
    includeNativeTokens: true,
    includeErc20Tokens: false,
  });
  assert(
    Array.isArray(result.data.tokens),
    "result.data.tokens should be an array",
  );
  // expect at least some native ETH/MATIC results across 3 networks
  assert(
    (result.data.tokens ?? []).length > 0,
    "expected tokens across multiple networks",
  );
});

console.log("\n\x1b[1mnft.getNftsForOwner\x1b[0m");

await test("uses client-level network (slug)", async () => {
  const result = await clientBySlug.nft.getNftsForOwner({ owner: VITALIK });
  assert(
    typeof result.totalCount === "number",
    "totalCount should be a number",
  );
  assert(
    (result.totalCount ?? 0) > 0,
    "Vitalik should own some NFTs on mainnet",
  );
});

await test("uses client-level network (CAIP-2 from viem chain)", async () => {
  const result = await clientByChain.nft.getNftsForOwner({ owner: VITALIK });
  assert(
    typeof result.totalCount === "number",
    "totalCount should be a number",
  );
});

await test("uses client-level network (CAIP-2)", async () => {
  const result = await clientByCaip2.nft.getNftsForOwner({ owner: VITALIK });
  assert(
    typeof result.totalCount === "number",
    "totalCount should be a number",
  );
});

await test("per-request network override (slug)", async () => {
  // client defaults to mainnet but we override to base
  const mainnetResult = await clientBySlug.nft.getNftsForOwner({
    owner: VITALIK,
  });
  const baseResult = await clientBySlug.nft.getNftsForOwner({
    owner: VITALIK,
    network: "base-mainnet",
  });
  // Different chains — counts may differ (just verify both return valid shapes)
  assert(
    typeof mainnetResult.totalCount === "number",
    "mainnet totalCount should be a number",
  );
  assert(
    typeof baseResult.totalCount === "number",
    "base totalCount should be a number",
  );
});

await test("per-request network override (CAIP-2)", async () => {
  const result = await clientBySlug.nft.getNftsForOwner({
    owner: VITALIK,
    network: "eip155:1",
  });
  assert(
    typeof result.totalCount === "number",
    "totalCount should be a number",
  );
});

await test("pageSize param", async () => {
  const result = await clientBySlug.nft.getNftsForOwner({
    owner: VITALIK,
    pageSize: 2,
    withMetadata: false,
  });
  assert((result.ownedNfts ?? []).length <= 2, "should respect pageSize=2");
});

console.log("\n\x1b[1mtransfers.getAssetTransfers\x1b[0m");

await test("uses client-level network (slug)", async () => {
  const result = await clientBySlug.transfers.getAssetTransfers({
    fromAddress: VITALIK,
    category: ["external"],
    maxCount: "0x5",
    order: "desc",
    withMetadata: true,
  });
  assert(Array.isArray(result.transfers), "transfers should be an array");
  assert((result.transfers ?? []).length > 0, "expected at least one transfer");
});

await test("uses client-level network (CAIP-2 from viem chain)", async () => {
  const result = await clientByChain.transfers.getAssetTransfers({
    fromAddress: VITALIK,
    category: ["external"],
    maxCount: "0x3",
  });
  assert(Array.isArray(result.transfers), "transfers should be an array");
});

await test("per-request network override (slug)", async () => {
  const result = await clientBySlug.transfers.getAssetTransfers({
    fromAddress: VITALIK,
    category: ["external", "erc20"],
    network: "base-mainnet",
    maxCount: "0x5",
  });
  assert(Array.isArray(result.transfers), "transfers should be an array");
});

await test("per-request network override (CAIP-2)", async () => {
  const result = await clientBySlug.transfers.getAssetTransfers({
    fromAddress: VITALIK,
    category: ["external"],
    network: "eip155:137", // Polygon
    maxCount: "0x3",
  });
  assert(Array.isArray(result.transfers), "transfers should be an array");
});

console.log(
  "\n\x1b[1mparked viem adapter (raw viem client + dataActions)\x1b[0m",
);

await test("client.extend(dataActions) works identically", async () => {
  const result = await rawViemClient.transfers.getAssetTransfers({
    fromAddress: VITALIK,
    category: ["external"],
    maxCount: "0x3",
    order: "desc",
  });
  assert(Array.isArray(result.transfers), "transfers should be an array");
});

await test("nft via raw viem client", async () => {
  const result = await rawViemClient.nft.getNftsForOwner({
    owner: VITALIK,
    pageSize: 1,
  });
  assert(
    typeof result.totalCount === "number",
    "totalCount should be a number",
  );
});

console.log("\n\x1b[1mportfolio — new methods\x1b[0m");

await test("getTokenBalancesByAddress", async () => {
  const result = await clientBySlug.portfolio.getTokenBalancesByAddress({
    addresses: [{ address: VITALIK, networks: ["eth-mainnet"] }],
  });
  assert(Array.isArray(result.data.tokens), "data.tokens should be an array");
});

await test("getNftsByAddress (paginated body method)", async () => {
  const result = await clientBySlug.portfolio.getNftsByAddress({
    addresses: [{ address: VITALIK, networks: ["eth-mainnet"] }],
    pageSize: 2,
  });
  assert(
    Array.isArray(result.data.ownedNfts),
    "data.ownedNfts should be an array",
  );
});

await test("getNftContractsByAddress", async () => {
  const result = await clientBySlug.portfolio.getNftContractsByAddress({
    addresses: [{ address: VITALIK, networks: ["eth-mainnet"] }],
    pageSize: 2,
  });
  assert(
    Array.isArray(result.data.contracts),
    "data.contracts should be an array",
  );
});

console.log("\n\x1b[1mprices\x1b[0m");

await test("getTokenPricesBySymbol (chain-agnostic)", async () => {
  const result = await clientBySlug.prices.getTokenPricesBySymbol({
    symbols: ["ETH"],
  });
  assert(Array.isArray(result.data), "data should be an array");
  assert((result.data ?? []).length > 0, "expected a price for ETH");
});

await test("getTokenPricesByAddress (network in entry)", async () => {
  // USDC on mainnet
  const result = await clientBySlug.prices.getTokenPricesByAddress({
    addresses: [
      {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        network: "eth-mainnet",
      },
    ],
  });
  assert(Array.isArray(result.data), "data should be an array");
});

await test("getHistoricalTokenPrices (symbol form)", async () => {
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const result = await clientBySlug.prices.getHistoricalTokenPrices({
    symbol: "ETH",
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    interval: "1h",
  });
  assert(Array.isArray(result.data), "data should be an array");
});

console.log("\n\x1b[1mnft — new methods\x1b[0m");

// BAYC — stable, well-known contract
const BAYC = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";

await test("getContractMetadata", async () => {
  const result = await clientBySlug.nft.getContractMetadata({
    contractAddress: BAYC,
  });
  assert(
    typeof result.address === "string",
    "contract metadata should include the address",
  );
});

await test("getNftMetadata", async () => {
  const result = await clientBySlug.nft.getNftMetadata({
    contractAddress: BAYC,
    tokenId: "1",
  });
  assert(result.tokenId === "1", "should return the requested token");
});

await test("getFloorPrice", async () => {
  const result = await clientBySlug.nft.getFloorPrice({
    contractAddress: BAYC,
  });
  assert(
    typeof result === "object" && result != null,
    "should return floor prices",
  );
});

await test("isSpamContract", async () => {
  const result = await clientBySlug.nft.isSpamContract({
    contractAddress: BAYC,
  });
  assert(typeof result.isSpamContract === "boolean", "should classify spam");
});

await test("getNftsForContract with pageSize-style limit", async () => {
  const result = await clientBySlug.nft.getNftsForContract({
    contractAddress: BAYC,
    limit: 2,
    withMetadata: false,
  });
  assert(Array.isArray(result.nfts), "nfts should be an array");
  assert((result.nfts ?? []).length <= 2, "should respect limit");
});

console.log("\n\x1b[1mtoken (JSON-RPC)\x1b[0m");

// USDC contract on mainnet
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

await test("getTokenBalances", async () => {
  const result = await clientBySlug.token.getTokenBalances({
    address: VITALIK,
    tokenSpec: [USDC],
  });
  assert(
    Array.isArray(result.tokenBalances),
    "tokenBalances should be an array",
  );
});

await test("getTokenMetadata", async () => {
  const result = await clientBySlug.token.getTokenMetadata({
    contractAddress: USDC,
  });
  assert(result.symbol === "USDC", "should return USDC metadata");
});

await test("getTokenAllowance", async () => {
  const result = await clientBySlug.token.getTokenAllowance({
    contract: USDC,
    owner: VITALIK,
    spender: VITALIK,
  });
  assert(typeof result === "string", "allowance should be a decimal string");
});

console.log("\n\x1b[1mpagination companions\x1b[0m");

await test("nft.getNftsForOwnerPages walks two pages", async () => {
  let pages = 0;
  let lastPageKey: string | undefined;
  for await (const page of clientBySlug.nft.getNftsForOwnerPages(
    { owner: VITALIK, pageSize: 5, withMetadata: false },
    { maxPages: 2 },
  )) {
    pages += 1;
    if (pages === 1) lastPageKey = page.pageKey;
  }
  assert(pages === 2, `expected 2 pages, got ${pages}`);
  assert(!!lastPageKey, "first page should carry a cursor");
});

await test("transfers.getAssetTransfersPages walks two pages", async () => {
  let pages = 0;
  for await (const page of clientBySlug.transfers.getAssetTransfersPages(
    { fromAddress: VITALIK, category: ["external"], maxCount: "0x2" },
    { maxPages: 2 },
  )) {
    pages += 1;
    assert(Array.isArray(page.transfers), "each page carries transfers");
  }
  assert(pages === 2, `expected 2 pages, got ${pages}`);
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
const total = passed + failed;
if (failed === 0) {
  console.log(`\x1b[32m✓ All ${total} tests passed\x1b[0m`);
} else {
  console.log(`\x1b[31m✗ ${failed}/${total} tests failed\x1b[0m`);
  process.exit(1);
}
