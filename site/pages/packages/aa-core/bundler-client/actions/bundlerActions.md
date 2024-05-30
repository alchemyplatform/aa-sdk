---
title: bundlerActions
description: Overview of the bundlerActions method in aa-core client
---

# bundlerActions

Allows you to extend a viem `Client` with the new 4337 methods.

## Usage

:::code-group

```ts [example.ts]
import { bundlerActions } from "@alchemy/aa-core";
import { createPublicClient, http } from "viem";

const client = createPublicClient({
  chain: mainnet,
  transport: http("https://eth-mainnet.g.alchemy.com/v2/demo"),
}).extend(bundlerActions);
```

## Returns

### `BundlerActions`

An object containing utility methods for calling the [Rundler RPC Methods](/packages/aa-core/bundler-client/index#rpc-methods).

## Parameters

### `Client`

A viem Client that supports making JSON RPC calls to a Provider that supports the 4337 methods.
