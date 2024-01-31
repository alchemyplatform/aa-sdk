---
outline: deep
head:
  - - meta
    - property: og:title
      content: getUserOperationReceipt
  - - meta
    - name: description
      content: Overview of the getUserOperationReceipt action available on the BundlerClient
  - - meta
    - property: og:description
      content: Overview of the getUserOperationReceipt action available on the BundlerClient
---

# getUserOperationReceipt

calls `eth_getUserOperationReceipt` and returns `UserOperationReceipt` if found otherwise `null`

## Usage

::: code-group

```ts [example.ts]
import { client } from "./client";

const receipt = await client.getUserOperationReceipt("0xUserOperationHash");
```

<<< @/snippets/bundlerClient.ts
:::

## Returns

### `Promise<UserOperationReceipt | null>`

The User Operation Receipt if found, otherwise `null`

## Parameters

### `hash: Hash`

The hash of the User Operation to fetch
