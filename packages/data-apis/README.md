# @alchemy/data-apis (MVP)

A vertical-slice prototype of the Data APIs SDK, built to prove the architecture
before scaling to the full v1 surface (Portfolio, Prices, NFT, Token, Transfers).

## What this proves

One method per seam, not full coverage:

| Method                         | Channel                                   | What it demonstrates                                                                                           |
| ------------------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `portfolio.getTokensByAddress` | REST → global `api.g.alchemy.com/data/v1` | Multi-network request bodies via `AlchemyRestClient`; networks are payload, the client's chain is not involved |
| `nft.getNftsForOwner`          | REST → `{network}.g.alchemy.com/nft/v3`   | Network-scoped endpoint resolution with per-request `network` override falling back to the client default      |
| `transfers.getAssetTransfers`  | JSON-RPC → `AlchemyTransport`             | Plain viem action; network override derives a transport instance from `client.transport.config`                |

Plus the two entry points:

```ts
// Data-only developers (no viem knowledge required)
const data = createDataClient({ apiKey, network: "eth-mainnet" });

// Developers already on a viem client with an Alchemy transport
const client = createClient({
  chain: mainnet,
  transport: alchemyTransport({ apiKey }),
}).extend(dataActions);
```

Network inputs accept all three formats everywhere, resolved by
`resolveNetwork()` in `@alchemy/common`: a viem `Chain`, an Alchemy slug
(`"eth-mainnet"`), or CAIP-2 (`"eip155:1"`, `"solana:mainnet"`). The slug ↔
chain-ID mapping is derived from the existing daikon-generated
`ALCHEMY_RPC_MAPPING` — no second registry.

## Generated internals

Param/result types are generated from the docs repo's bundled OpenAPI/OpenRPC
specs by `@alchemy/api-codegen` (see that package's README for the
snapshot/generate pipeline). `src/generated/` is committed, machine-owned, and
never re-exported directly: the public types in `src/types.ts` are
hand-reviewed aliases, and `codegen.manifest.ts` maps spec operations to the
generated surface — referencing a renamed/removed spec operation fails
`pnpm generate` loudly.

## Companion changes in @alchemy/common

- `networks/networkRegistry.ts`: `resolveNetwork` + network types (slug map
  derived from the registry URLs; to be emitted by ws-tools properly)
- `AlchemyRestClient` is now exported (was written for signer v5 but unexported)

## Deliberately out of scope (tracked in the data SDK scope plan)

- Rest client hardening: retries, timeouts, request-id, first-class query params
- Pagination iterators, error normalization, the SDK manifest, remaining methods
- ws-tools generator change to emit `{ slug, chainId, caip2 }` entries +
  the `KnownAlchemyNetwork` union
