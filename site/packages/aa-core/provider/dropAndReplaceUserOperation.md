---
outline: deep
head:
  - - meta
    - property: og:title
      content: dropAndReplaceUserOperation
  - - meta
    - name: description
      content: Overview of the dropAndReplaceUserOperation method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the dropAndReplaceUserOperation method on ISmartAccountProvider
---

# dropAndReplaceUserOperation

Attempts to drop and replace an existing user operation by increasing fees. The fee replacement logic sets the `maxPriorityFee` and `maxPriorityFeePerGas` to the `max(current_estimate, prev_uo * 1.1)` (ie. the current max fee or 110% of the previous fee).

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";

const { request } = await provider.sendUserOperation({
  data: "0xCalldata",
  target: "0xTarget",
  value: 0n,
});

const { hash: replacedHash } = await provider.dropAndReplaceUserOperation(
  request
);
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<{ hash: Hash, request: UserOperationRequest }>`

A Promise containing the hash of the user operation and the request that was sent.

**Note**: The hash is not the User Operation Receipt. The user operation still needs to be bundled and included in a block. The user operation result is more of a proof of submission than a receipt.

## Parameters

### `UserOperationRequest`

A previously submitted UserOperation.
