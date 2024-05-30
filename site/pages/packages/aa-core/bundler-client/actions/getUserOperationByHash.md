---
title: getUserOperationByHash
description: Overview of the getUserOperationByHash action available on the BundlerClient
---

# getUserOperationByHash

calls `eth_getUserOperationByHash` and returns the `UserOperationResponse` if found

## Usage

:::code-group

```ts [example.ts]
import { client } from "./client";

const uo = await client.getUserOperationByHash("0xUserOperationHash");
```

<<< @/snippets/aa-core/bundlerClient.ts
:::

## Returns

### `Promise<UserOperationResponse | null>`

The User Operation if found, otherwise `null`

## Parameters

### `hash: Hash`

The hash of the User Operation to fetch
