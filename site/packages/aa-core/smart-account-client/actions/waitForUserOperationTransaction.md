---
outline: deep
head:
  - - meta
    - property: og:title
      content: waitForUserOperationTransaction
  - - meta
    - name: description
      content: Overview of the waitForUserOperationTransaction method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the waitForUserOperationTransaction method on SmartAccountClient
---

# waitForUserOperationTransaction

Attempts to fetch for UserOperationReceipt `txMaxRetries` amount of times, at an interval of `txRetryIntervalMs` milliseconds (with a multiplier of `txRetryMultiplier`) using the connected account.

Note: For more details on how to modify the retry configurations for this method, see the [constructor](/packages/aa-core/smart-account-client/index.md) parameters.

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
const userOperationResult = await smartAccountClient.sendUserOperation({
  uo: {
    data: "0xCalldata",
    target: "0xTarget",
    value: 0n,
  },
});

// [!code focus:99]
const txHash = await smartAccountClient.waitForUserOperationTransaction({
  hash: userOperationResult.hash,
});
```

<<< @/snippets/aa-core/smartAccountClient.ts
:::

## Returns

### `Promise<Hash>`

A `Promise` containing the hash of the transaction the user operation was included in.

If `txMaxRetries` is exceeded without the user operation included in a block yet, this endpoint will throw an error. You should handle this by retrying with a higher fee and/or changing the retry configurations.

## Parameters

### `hash: Hash`

The hash of the user operation returned from [sendUserOperation](./sendUserOperation).
