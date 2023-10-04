---
outline: deep
head:
  - - meta
    - property: og:title
      content: waitForUserOperationTransaction
  - - meta
    - name: description
      content: Overview of the waitForUserOperationTransaction method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the waitForUserOperationTransaction method on ISmartAccountProvider
---

# waitForUserOperationTransaction

Attempts to fetch for UserOperationReceipt `txMaxRetries` amount of times, at an interval of `txRetryIntervalMs` milliseconds (with a multiplier of `txRetryMulitplier`) using the connected account.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const userOperationResult = await provider.sendUserOperation({
  data: "0xCalldata",
  target: "0xTarget",
  value: 0n,
});

// [!code focus:99]
provider.waitForUserOperationTransaction({
  hash: result.hash,
});
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<Hash>`

A Promise containing the hash of the transaction the user operation was included in.

If `txMaxRetries` is exceeded without the user operation included in a block yet, this endpoint will throw an error. You should handle this by retrying with a higher fee and/or changing the retry configurations.

## Parameters

### `hash: Hash`

The hash of the user operation returned from [sendUserOperation](./sendUserOperation).

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
provider.waitForUserOperationTransaction({
  hash: "0xUserOpResultHash", // [!code focus]
});
```

:::
