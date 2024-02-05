---
outline: deep
head:
  - - meta
    - property: og:title
      content: getSupportedEntryPoints
  - - meta
    - name: description
      content: Overview of the getSupportedEntryPoints action available on the BundlerClient
  - - meta
    - property: og:description
      content: Overview of the getSupportedEntryPoints action available on the BundlerClient
---

# getSupportedEntryPoints

calls `eth_supportedEntryPoints` and returns the entry points the RPC supports

## Usage

::: code-group

```ts [example.ts]
import { client } from "./client";

const entryPoints = await client.getSupportedEntryPoints();
```

<<< @/snippets/aa-core/bundlerClient.ts
:::

## Returns

### `Promise<Address[]>`

The list of supported entry points by the underlying RPC Provider
