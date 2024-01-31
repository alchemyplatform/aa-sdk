---
outline: deep
head:
  - - meta
    - property: og:title
      content: getUserOperationByHash
  - - meta
    - name: description
      content: Overview of the getUserOperationByHash method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the getUserOperationByHash method on ISmartAccountProvider
---

# getUserOperationByHash

Return a `UserOperation` (UO) based on a hash (userOpHash).

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
smartAccountClient.getUserOperationByHash({ hash: "0xUserOpResultHash" });
```

<<< @/snippets/smartAccountClient.ts

:::

## Returns

### `Promise<UserOperationResponse | null>`

A Promise containing the UO if found on-chain or null if not found.

## Parameters

### `hash: Hash`

The hash of the user operation returned from [sendUserOperation](./sendUserOperation).
