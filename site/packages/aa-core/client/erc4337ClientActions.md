---
outline: deep
head:
  - - meta
    - property: og:title
      content: erc4337ClientActions
  - - meta
    - name: description
      content: Overview of the erc4337ClientActions method in aa-core client
  - - meta
    - property: og:description
      content: Overview of the erc4337ClientActions method in aa-core client
next:
  text: Utils
---

# erc4337ClientActions

Allows you to extend a viem `Client` with the new 4337 methods.

## Usage

::: code-group

```ts [example.ts]
import { erc4337ClientActions } from "@alchemy/aa-core";
import { createPublicClient } from "viem";

const client = createPublicClient({
  chain: mainnet,
  rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/demo",
}).extend(erc4337ClientActions);
```

## Returns

### `Erc4337Actions`

An object containing utility methods for calling the [ERC-4337 Methods](/packages/aa-core/client/#rpc-methods).

## Parameters

### `Client`

A viem Client that supports making JSON RPC calls to a Provider that supports the 4337 methods.
