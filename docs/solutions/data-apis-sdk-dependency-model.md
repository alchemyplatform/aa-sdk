---
title: Data APIs SDK Dependency Model
date: 2026-06-11
tags:
  - data-apis
  - sdk
  - viem
area: data-apis
---

# Data APIs SDK Dependency Model

## TL;DR

Recommend a dependency-light `@alchemy/data-apis` core, not viem as the
required foundation.

Keep viem support as an optional adapter for existing EVM and aa-sdk users.
Use `@alchemy/common` for shared viem-free REST/RPC/auth/error/network
primitives. Keep Data API product logic in `@alchemy/data-apis`.

Do not use Stainless for v1. Run a POC after spec ownership and quality are
settled.

## Current Branch

The branch implements `createDataClient` as a viem wrapper:
`createClient({ chain, transport }).extend(dataActions)`.

`viem` is a peer dependency. That avoids duplicate-version conflicts, but users
still have to install an Ethereum SDK for non-EVM data use cases.

The current network model is good: it accepts Alchemy slugs, CAIP-2 ids, and
viem chains. The problem is making viem the root abstraction. The code has to
fabricate viem `Chain` objects for slug, CAIP-2, and Solana inputs, which is a
sign the abstraction is serving viem instead of Data APIs.

As of this review, npm reports `viem@2.52.2` at 9,616 files and about 24 MB
unpacked. In this repo, `viem@2.46.3` takes about 48 MB per pnpm peer variant.
This is a real install-footprint and product-positioning cost for Solana and
Hyperliquid developers.

## Competitors

Pattern: cross-chain data SDKs are HTTP/data clients, not viem wrappers.
QuickNode's official SDK has no viem, ethers, or wagmi dependency or source
reference. Using QuickNode RPC with viem is endpoint compatibility, not evidence
that `@quicknode/sdk` is viem-based.

| Provider            | SDK shape                                                                                                                                                                                       | Takeaway                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| QuickNode           | `@quicknode/sdk`. Rust/NAPI core with Node, Python, Rust, and Ruby wrappers. No viem. Not browser-compatible. Direct chain calls should use the user's preferred chain library.                 | Product-client namespaces are good. Native bindings are a poor fit for our browser and dependency-light goals.                  |
| Moralis             | `moralis`. Data modules for EVM, Solana, Aptos, Bitcoin, Streams, Auth. No viem.                                                                                                                | Strong missing competitor. Validates chain-specific modules over an EVM-root abstraction.                                       |
| Covalent / GoldRush | `@covalenthq/client-sdk`. Service namespaces over REST/GraphQL. Uses chain names like `eth-mainnet`. No viem.                                                                                   | Strong missing competitor. Data-native chain ids are normal. Their Hyperliquid and Solana docs also make non-EVM first-class.   |
| Allium              | REST-first Realtime APIs across 20+ chains, including Solana. Auth is a plain `X-API-KEY` header. No official public JS data SDK found.                                                         | A lightweight HTTP-first data API is a credible market shape.                                                                   |
| Dune / Sim          | Sim APIs are REST-first with `X-Sim-Api-Key`, EVM and Solana route families, `chain_ids` query params/tags, and cursor pagination. Dune's separate analytics SDK is a lightweight query client. | Data APIs do not need to depend on an EVM client library.                                                                       |
| Helius              | `helius-sdk`. Solana SDK with Solana ecosystem peer deps. No viem.                                                                                                                              | For Solana, native ecosystem deps are acceptable; EVM deps are not.                                                             |
| Ankr                | `@ankr.com/ankr.js`. Compact API client with axios. No viem.                                                                                                                                    | Another infra/data SDK using plain HTTP client style.                                                                           |
| Reservoir           | `@reservoir0x/reservoir-sdk`. NFT liquidity SDK with viem as a peer dep.                                                                                                                        | Useful counterexample, but not like-for-like. EVM liquidity SDKs can justify viem; cross-chain data SDKs should not require it. |

## Stainless

Stainless is worth evaluating, but not for immediate v1.

Pros:

- Generates SDKs, docs, CLI, and MCP from OpenAPI.
- Handles auth, retries, pagination helpers, publishing, and release flow.
- TypeScript SDKs use native `fetch` and support Node, Deno, Bun, Workers, and
  Edge runtimes.
- Avoids runtime request validation, which helps code size and forward
  compatibility.

Cons:

- Requires high-quality OpenAPI. Our review already found spec-source risk.
- Generated SDK shape will not naturally match aa-sdk viem actions.
- Custom aa-sdk ergonomics would need custom code or a separate adapter.
- Adds vendor and release-workflow dependency.

Recommendation: POC Stainless on Portfolio/Prices after specs are reliable.
Do not block v1 on it.

## Options

| Option                                  | Pros                                                                                      | Cons                                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Keep viem in core                       | Fastest from current branch. Best EVM ergonomics. Matches aa-sdk actions.                 | Weak non-EVM story. Required Ethereum SDK. Wrong default for H2 Solana/Hyperliquid focus. |
| Dependency-light core plus viem adapter | Best non-EVM story. Preserves viem UX for EVM users. Matches competitor REST-first shape. | Requires small package split/refactor.                                                    |
| Stainless-generated SDK                 | Best long-term multi-language path. Strong generated docs/MCP story.                      | Spec/process risk. Less control over SDK shape. Not a v1 unblocker.                       |

## Recommendation

Ship option 2.

- `@alchemy/data-apis`: core SDK, no viem dependency.
- `@alchemy/data-apis/viem` or `@alchemy/data-apis-viem`: optional viem adapter,
  peer dependency on viem, exports `dataActions`.
- Public config uses `chain`, not `network`.
- Multi-chain methods take `chains`.
- Core accepts Alchemy slugs and CAIP-2 ids.
- Viem adapter additionally accepts viem `Chain`.

Use `@alchemy/common` for shared internals, but split the entrypoints:

- viem-free common:
  - REST client
  - generic JSON-RPC fetch client
  - auth/header handling
  - retry, timeout, abort handling
  - API errors and key redaction
  - slug, CAIP-2, and numeric chain normalization
- viem common:
  - `alchemyTransport`
  - viem `Chain` support
  - viem error wrapping

Keep these in `@alchemy/data-apis`:

- generated Data API schemas/types
- operation manifests
- public namespaces and method names
- request/response mappers
- Data API pagination helpers

## Sources

- QuickNode SDK docs: https://www.quicknode.com/docs/quicknode-sdk
- QuickNode SDK repo: https://github.com/quicknode/sdk
- QuickNode SDK npm: https://www.npmjs.com/package/@quicknode/sdk
- Moralis Data API docs: https://docs.moralis.com/data-api/overview
- Moralis npm: https://www.npmjs.com/package/moralis
- GoldRush docs: https://goldrush.dev/docs/
- Covalent SDK npm: https://www.npmjs.com/package/@covalenthq/client-sdk
- Allium API docs: https://docs.allium.so/api/overview
- Allium Realtime API docs: https://docs.allium.so/api/developer/overview
- Dune Sim docs: https://docs.sim.dune.com/
- Dune Sim balances: https://docs.sim.dune.com/evm/balances
- Dune SDK docs: https://docs.dune.com/api-reference/sdks/typescript
- Helius docs: https://www.helius.dev/docs
- Helius SDK npm: https://www.npmjs.com/package/helius-sdk
- Ankr SDK npm: https://www.npmjs.com/package/@ankr.com/ankr.js
- Reservoir SDK npm: https://www.npmjs.com/package/@reservoir0x/reservoir-sdk
- Stainless docs: https://www.stainless.com/docs/
- Stainless TypeScript runtime support:
  https://www.stainless.com/docs/sdks/typescript/
- Stainless runtime validation rationale:
  https://www.stainless.com/docs/design/runtime-request-validation/
