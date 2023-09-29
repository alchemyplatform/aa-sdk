---
outline: deep
head:
  - - meta
    - property: og:title
      content: getUserOperationByHash
  - - meta
    - name: description
      content: Overview of the getUserOperationByHash action available on the PublicErc4337Client
  - - meta
    - property: og:description
      content: Overview of the getUserOperationByHash action available on the PublicErc4337Client
---

# getUserOperationByHash

calls `eth_getUserOperationByHash` and returns the `UserOperationResponse` if found

## Usage

::: code-group

```ts [example.ts]
import { client } from "./client";

const uo = await client.getUserOperationByHash("0xUserOperationHash");
```

<<< @/snippets/client.ts
:::

## Returns

### `Promise<UserOperationResponse | null>`

The User Operation if found, otherwise `null`

## Parameters

### `hash: Hash`

The hash of the User Operation to fetch
