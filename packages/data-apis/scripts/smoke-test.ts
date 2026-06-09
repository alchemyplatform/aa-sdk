/**
 * Smoke test for @alchemy/data-apis — runs against the real Alchemy API.
 *
 * Usage:
 *   ALCHEMY_API_KEY=<your-key> pnpm --filter @alchemy/data-apis smoke-test
 *
 * What it covers:
 *   - createAlchemyDataClient with slug, viem Chain, and CAIP-2 network inputs
 *   - portfolio.getTokensByAddress (REST, multi-network, all three input formats)
 *   - nft.getNftsForOwner (REST, per-network, per-request override)
 *   - transfers.getAssetTransfers (JSON-RPC, per-request network override)
 */

import { mainnet } from "viem/chains";
import { BaseError } from "@alchemy/common";
import { createAlchemyDataClient } from "../src/client.js";
import { dataActions } from "../src/decorator.js";
import { alchemyTransport } from "@alchemy/common";
import { createClient } from "viem";

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
  if (!condition) throw new BaseError(`Assertion failed: ${message}`);
}

// ─── Clients ──────────────────────────────────────────────────────────────────

// Three ways to specify the default network
const clientBySlug = createAlchemyDataClient({
  apiKey: API_KEY,
  network: "eth-mainnet",
});
const clientByChain = createAlchemyDataClient({
  apiKey: API_KEY,
  network: mainnet,
});
const clientByCaip2 = createAlchemyDataClient({
  apiKey: API_KEY,
  network: "eip155:1",
});

// Decorator path: bring-your-own viem client
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
  assert(result.data.tokens.length > 0, "expected at least one token");
});

await test("multi-network: viem Chain + slug + CAIP-2 in one call", async () => {
  const result = await clientBySlug.portfolio.getTokensByAddress({
    addresses: [
      {
        address: VITALIK,
        networks: [
          mainnet, // viem Chain
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
    result.data.tokens.length > 0,
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
  assert(result.totalCount > 0, "Vitalik should own some NFTs on mainnet");
});

await test("uses client-level network (viem Chain)", async () => {
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
  assert(result.ownedNfts.length <= 2, "should respect pageSize=2");
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
  assert(result.transfers.length > 0, "expected at least one transfer");
});

await test("uses client-level network (viem Chain)", async () => {
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

console.log("\n\x1b[1mdecorator path (raw viem client + dataActions)\x1b[0m");

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

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
const total = passed + failed;
if (failed === 0) {
  console.log(`\x1b[32m✓ All ${total} tests passed\x1b[0m`);
} else {
  console.log(`\x1b[31m✗ ${failed}/${total} tests failed\x1b[0m`);
  process.exit(1);
}
