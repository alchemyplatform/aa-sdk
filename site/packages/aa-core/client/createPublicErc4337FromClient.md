---
outline: deep
head:
  - - meta
    - property: og:title
      content: createPublicErc4337FromClient
  - - meta
    - name: description
      content: Overview of the createPublicErc4337FromClient method in aa-core client
  - - meta
    - property: og:description
      content: Overview of the createPublicErc4337FromClient method in aa-core client
---

# createPublicErc4337FromClient

Allows you to create an HTTP-based PublicErc4337Client from an already created PublicClient.

## Usage

::: code-group

```ts [example.ts]
import { createPublicErc4337FromClient } from "@alchemy/aa-core";
import { mainnet } from "viem/chains";
import { createPublicClient, http } from "viem";

const publicClient = createPublicClient({
  transport: http("https://eth-mainnet.g.alchemy.com/v2/demo"),
  chain: mainnet,
});

const client = createPublicErc4337FromClient(publicClient);
```

:::

## Returns

### `PublicErc4337Client<HttpTransport>`

An HTTP-based PublicErc4337Client that supports both traditional RPC methods and the new 4337 methods.

## Parameters

### `client: PublicClient`

The client to adapt to a 4337 client
