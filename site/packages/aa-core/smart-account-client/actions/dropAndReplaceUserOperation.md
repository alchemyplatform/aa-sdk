---
outline: deep
head:
  - - meta
    - property: og:title
      content: dropAndReplaceUserOperation
  - - meta
    - name: description
      content: Overview of the dropAndReplaceUserOperation method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the dropAndReplaceUserOperation method on SmartAccountClient
---

# dropAndReplaceUserOperation

Attempts to drop and replace an existing user operation by increasing fees. The fee replacement logic sets the `maxPriorityFee` and `maxPriorityFeePerGas` to the `max(current_estimate, prev_uo * 1.1)` (i.e. the current max fee or 110% of the previous fee).

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";

const { request } = await smartAccountClient.sendUserOperation({
  uo: {
    data: "0xCalldata",
    target: "0xTarget",
    value: 0n,
  },
});

const { hash: replacedHash } =
  await smartAccountClient.dropAndReplaceUserOperation(request);
```

<<< @/snippets/aa-core/smartAccountClient.ts
:::

## Returns

### `Promise<{ hash: Hash, request: UserOperationRequest }>`

A Promise containing the hash of the user operation request sent to the bundler with higher gas to be mined faster as the replacement of the input user operation request.

**Note**: The hash is not the User Operation Receipt. The user operation still needs to be bundled and included in a block. The user operation result is more of a proof of submission than a receipt.

## Parameters

### `DropAndReplaceUserOperationParameters<TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined>`

- `uoToDrop: UserOperationRequest`

A previously submitted `UserOperationRequest` to be dropped and replaced by a new user operation with higher gas to be mined faster

- `overrides?:` [`UserOperationOverrides`](/packages/aa-core/smart-account-client/types/userOperationOverrides.md)

Optional parameter where you can specify override values for `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit` or `paymasterAndData` on the user operation request

- `account?: SmartContractAccount`

If your client was not instantiated with an account, then you will have to pass the account in to this call.
