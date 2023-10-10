---
outline: deep
head:
  - - meta
    - property: og:title
      content: getSupportedEntryPoints
  - - meta
    - name: description
      content: Overview of the getSupportedEntryPoints action available on the PublicErc4337Client
  - - meta
    - property: og:description
      content: Overview of the getSupportedEntryPoints action available on the PublicErc4337Client
---

# getSupportedEntryPoints

calls `eth_supportedEntryPoints` and returns the entrypoints the RPC supports

## Usage

::: code-group

```ts [example.ts]
import { client } from "./client";

const entryPoints = await client.getSupportedEntryPoints();
```

<<< @/snippets/client.ts
:::

## Returns

### `Promise<Address[]>`

The list of supported entry points by the underlying RPC Provider
