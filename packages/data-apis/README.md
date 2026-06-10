# @alchemy/data-apis

Alchemy's Data APIs — Portfolio, Prices, NFT, Token, and Transfers — as
typed, viem-style actions. **Currently published under the `alpha` dist-tag.**

```bash
npm install @alchemy/data-apis@alpha viem
```

## Quickstart

Two equivalent entry points:

```ts
// Data-only developers (no viem knowledge required)
import { createDataClient } from "@alchemy/data-apis";

const data = createDataClient({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: "eth-mainnet", // or `mainnet` from viem/chains, or "eip155:1"
});

// Developers already holding a viem client with an Alchemy transport
import { createClient } from "viem";
import { mainnet } from "viem/chains";
import { alchemyTransport } from "@alchemy/common";
import { dataActions } from "@alchemy/data-apis";

const client = createClient({
  chain: mainnet,
  transport: alchemyTransport({ apiKey: process.env.ALCHEMY_API_KEY }),
}).extend(dataActions);
```

Every action is also individually importable
(`import { getNftsForOwner } from "@alchemy/data-apis"`) for tree-shaking and
composability.

## Namespaces

```ts
// Portfolio — multi-network queries; networks travel per request
const tokens = await data.portfolio.getTokensByAddress({
  addresses: [
    { address: "0x...", networks: [mainnet, "base-mainnet", "solana-mainnet"] },
  ],
});
// also: getTokenBalancesByAddress, getNftsByAddress, getNftContractsByAddress

// Prices — chain-agnostic or address+network
const prices = await data.prices.getTokenPricesBySymbol({
  symbols: ["ETH", "USDC"],
});
// also: getTokenPricesByAddress, getHistoricalTokenPrices

// NFT — full v3 read surface (21 methods): ownership, metadata (+ batch),
// contracts/collections, owners, sales, floor price, search, spam/airdrop/rarity
const nfts = await data.nft.getNftsForOwner({ owner: "0x..." });

// Token — balances, metadata, allowance (JSON-RPC)
const balances = await data.token.getTokenBalances({ address: "0x..." });

// Transfers — historical transfer queries (JSON-RPC)
const transfers = await data.transfers.getAssetTransfers({
  category: ["erc20"],
});
```

### Networks: three formats, everywhere

Anywhere a network is accepted you can pass a viem `Chain`, an Alchemy slug
(`"eth-mainnet"`), or a CAIP-2 id (`"eip155:1"`, `"solana:mainnet"`) —
resolved by `resolveNetwork()` in `@alchemy/common`. Single-network methods
use the client's default network with a per-request `network` override;
multi-network methods (Portfolio, Prices-by-address) take networks in the
request itself. Registry-unknown slugs are passed through as an escape hatch.

### Pagination

Paginated methods have `*Pages` companions returning async generators that
manage cursors for you (and refuse to loop forever on repeated cursors):

```ts
for await (const page of data.nft.getNftsForOwnerPages(
  { owner: "0x..." },
  { maxPages: 10, signal: controller.signal },
)) {
  for (const nft of page.ownedNfts ?? []) {
    // ...
  }
}
```

### Errors

Both channels (REST and JSON-RPC) normalize failures into `AlchemyApiError`
from `@alchemy/common`, carrying `status`, `code`, `requestId` (the
client-generated `X-Alchemy-Client-Request-Id`), and `retryAfter` when known.
REST requests retry 429/5xx/network failures with exponential backoff
(honoring `Retry-After`) and time out per attempt; pass an `AbortSignal` via
the per-request options to cancel.

## Generated internals

Param/result types are generated from the docs repo's bundled OpenAPI/OpenRPC
specs by `@alchemy/api-codegen` (see that package's README for the
snapshot/generate pipeline). `src/generated/` is committed, machine-owned, and
never re-exported directly: the public types in `src/types.ts` are
hand-reviewed aliases, and `codegen.manifest.ts` maps spec operations to the
generated surface — referencing a renamed/removed spec operation fails
`pnpm generate` loudly.

## Releasing

While in alpha this package is deliberately **not** in `lerna.json`'s
fixed-version publish set, so the regular release workflow can't ship it as
`latest`. To publish an alpha:

```bash
pnpm --filter @alchemy/data-apis build
cd packages/data-apis && pnpm publish --tag alpha
```

Graduation checklist (when the team blesses a stable release):

1. Bump `version` to the shared monorepo version (drop the `-alpha.N` suffix).
2. Add `"packages/data-apis"` to `lerna.json`'s `packages` array.
3. Remove `publishConfig.tag`.
4. Announce the surface as semver-stable.
