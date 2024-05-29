---
outline: deep
head:
  - - meta
    - property: og:title
      content: UserOperationFeeOptionsField
  - - meta
    - name: description
      content: Overview of the UserOperationFeeOptionsField type in aa-core types
  - - meta
    - property: og:description
      content: Overview of the UserOperationFeeOptionsField type in aa-core types
---

# UserOperationFeeOptionsField

Merged type of [`BigNumberishRange`](/resources/types.md#bignumberishrange) with [`Multiplier`](/resources/types.md#multiplier) type that can be used as [`UserOperationFeeOptions`](./userOperationFeeOptions.md) fields for the [`SmartAccountClient`](/packages/aa-core/smart-account-client/index.md) to use during the gas fee calculation middlewares when constructing the user operation to send.

For example, if the below example `UserOperationFeeOptionsField` is set as the fee option for the `maxPriorityFeePerGas` field of [`UserOperationFeeOptions`](./userOperationFeeOptions.md), then the [`SmartAccountClient`](/packages/aa-core/smart-account-client/index.md) will apply 50% buffer to the estimated `maxPriorityFeePerGas`, then set the `maxPriorityFeePerGas` on the user operation as the larger value between the buffered `maxPriorityFeePerGas` fee and the min `maxPriorityFeePerGas` which is `100_000_000n` here.

```ts
/*
 * {
 *   min?: BigNumberish
 *   max?: BigNumberish
 *   multiplier?: number
 * }
 */
type UserOperationFeeOptionsFieldSchema = BigNumberishRange & Multiplier;
```

## Usage

```ts
import { type UserOperationFeeOptionsField } from "@alchemy/aa-core";

const userOperationFeeOptionsField: UserOperationFeeOptionsField = {
  min: 100_000_000n,
  multiplier: 1.5,
};
```
