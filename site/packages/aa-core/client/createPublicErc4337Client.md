---
outline: deep
head:
  - - meta
    - property: og:title
      content: createPublicErc4337Client
  - - meta
    - name: description
      content: Overview of the createPublicErc4337Client method in aa-core client
  - - meta
    - property: og:description
      content: Overview of the createPublicErc4337Client method in aa-core client
---

# createPublicErc4337Client

Allows you to create an HTTP-based PublicErc4337Client with a given RPC provider.

## Usage

::: code-group

```ts [example.ts]
import { createPublicErc4337Client } from "@alchemy/aa-core";
import { mainnet } from "viem/chains";

const client = createPublicErc4337Client({
  chain: mainnet,
  rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/demo",
});
```

:::

## Returns

### `PublicErc4337Client<HttpTransport>`

An HTTP-based PublicErc4337Client that supports both traditional RPC methods and the new 4337 methods.

## Parameters

### `chain: Chain`

The chain to connect to

### `rpcUrl: string`

The RPC URL to connect to

### `fetchOptions?: HttpTransportConfig["fetchOptions"]`

Optional set of params that let you override the default fetch options for the HTTP transport
