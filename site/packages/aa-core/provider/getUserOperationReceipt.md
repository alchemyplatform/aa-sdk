---
outline: deep
head:
  - - meta
    - property: og:title
      content: ISmartAccountProvider • getUserOperationReceipt
  - - meta
    - name: description
      content: Overview of the getUserOperationReceipt method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the getUserOperationReceipt method on ISmartAccountProvider
---

# getUserOperationReceipt

Return a UserOperationReceipt based on a hash (userOpHash).

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
provider.getUserOperationReceipt("0xUserOpResultHash");
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<UserOperationReceipt | null>`

A Promise containing the UserOperationReceipt if found on-chain or null if not found.

## Parameters

### `hash: Hash`

The hash of the user operation returned from [sendUserOperation](./sendUserOperation).
