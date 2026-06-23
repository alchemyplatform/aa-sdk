# @alchemy/data-apis

Alchemy's Data APIs — Portfolio, Prices, NFT, Token, and Transfers — as typed,
**chain-library-free** actions. No viem, wallet client, or ecosystem library is
required: the package's only runtime dependency is `@alchemy/common`, and
nothing EVM- or ecosystem-specific sits in the foundation. **Currently
published under the `alpha` dist-tag.**

```bash
npm install @alchemy/data-apis@alpha
```

## Quickstart

```ts
import { createDataClient } from "@alchemy/data-apis";

const data = createDataClient({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: "eth-mainnet", // optional — see Networks below
});

const nfts = await data.nft.getNftsForOwner({ owner: "0x..." });
```

Every action is also individually importable
(`import { getNftsForOwner } from "@alchemy/data-apis"`) for tree-shaking and
composability, taking `(client, params)`.

## Namespaces

```ts
// Portfolio — multi-network queries; networks travel per request.
// No client-level network needed at all.
const tokens = await data.portfolio.getTokensByAddress({
  addresses: [
    {
      address: "0x...",
      networks: ["eth-mainnet", "base-mainnet", "solana-mainnet"],
    },
  ],
});
// also: getTokenBalancesByAddress, getNftsByAddress, getNftContractsByAddress

// Prices — chain-agnostic or address+network
const prices = await data.prices.getTokenPricesBySymbol({
  symbols: ["ETH", "USDC"],
});
// also: getTokenPricesByAddress, getHistoricalTokenPrices

// NFT — full v3 read surface (21 methods)
const owned = await data.nft.getNftsForOwner({ owner: "0x..." });

// Token — balances, metadata, allowance (JSON-RPC)
const balances = await data.token.getTokenBalances({ address: "0x..." });

// Transfers — historical transfer queries (JSON-RPC)
const transfers = await data.transfers.getAssetTransfers({
  category: ["erc20"],
});
```

### Networks

Network inputs are strings, both ecosystem-neutral: Alchemy slugs
(`"eth-mainnet"`, exactly as the dashboard and API responses use) or CAIP-2
ids (`"eip155:1"`, `"solana:mainnet"`). Holding a viem chain object? The
bridge is one expression: `` `eip155:${chain.id}` ``.

The client-level `network` is optional and only a default: multi-network
methods (Portfolio, Prices-by-address) take networks in the request itself,
and every single-network method accepts a per-request `network` override that
wins over the default. Registry-unknown slugs pass through as an escape
hatch, so newly launched networks work without an SDK release.

### Proxy / frontend usage

Pass `url` to route Token and Transfers JSON-RPC traffic through your backend:
`createDataClient({ url: "https://your-backend/alchemy-rpc" })`. REST Data API
methods use service-scoped Alchemy URLs derived per request. `jwt` auth is also
supported.

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
from `@alchemy/data-apis`, carrying `status`, `code`, `requestId` (the
client-generated `X-Alchemy-Client-Request-Id`), and `retryAfter` when known.

```ts
import { AlchemyApiError } from "@alchemy/data-apis";
```

Requests retry 429/5xx/network failures with exponential backoff (honoring
`Retry-After`) and time out per attempt; pass an `AbortSignal` via the
per-request options to cancel. JSON-RPC-level errors are never retried.

## Ecosystem adapters

The core is deliberately chain-library-free (see the "Data SDK Foundation"
decision doc). Adapters ship as demand warrants, post-v1 — first in line is
`@alchemy/data-apis/viem`, a `dataActions` decorator for existing viem and
wallet-apis clients (`client.extend(dataActions)`). Its implementation is
already parked and tested at `src/viem/`; it is packaging work away from
shipping. Adapters depend on their ecosystem's library; the core never does.

## Generated internals

Param/result types are generated from the docs repo's bundled OpenAPI/OpenRPC
specs by `api-codegen` (repo root; see its README for the snapshot/generate
pipeline). `src/generated/` is committed, machine-owned, and never
re-exported directly: the public types in `src/types.ts` are hand-reviewed
aliases, and `codegen.manifest.ts` maps spec operations to the generated
surface — referencing a renamed/removed spec operation fails `pnpm generate`
loudly.

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
