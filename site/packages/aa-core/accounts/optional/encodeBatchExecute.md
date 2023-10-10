---
outline: deep
head:
  - - meta
    - property: og:title
      content: encodeBatchExecute
  - - meta
    - name: description
      content: Overview of the encodeBatchExecute method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the encodeBatchExecute method on BaseSmartContractAccount
---

# encodeBatchExecute

**NOTE**: Not all accounts support batching.

If your contract does, this method should encode a list of transactions into the call data that will be passed to your contract's `batchExecute` method.

## Example Implementation

::: code-group

```ts [example.ts]
import { SimpleAccountAbi } from "./simple-account-abi";
// [!code focus:99]
async encodeBatchExecute(
  txs: BatchUserOperationCallData
): Promise<`0x${string}`> {
  const [targets, datas] = txs.reduce(
    (accum, curr) => {
      accum[0].push(curr.target);
      accum[1].push(curr.data);

      return accum;
    },
    [[], []] as [Address[], Hex[]]
  );

  return encodeFunctionData({
    abi: SimpleAccountAbi,
    functionName: "executeBatch",
    args: [targets, datas],
  });
}
```

<<< @/snippets/simple-account-abi.ts
:::

## Returns

### `Promise<Hex>`

The promise containing the abi encoded function data for a call to your contract's `batchExecute` method

## Parameters

### `txs`: `BatchUserOperationCallData = UserOperationCallData[]`

An array of objects containing the target, value, and data for each transaction as `UserOperationCallData` with following fields:

- `target`: `string` - The address receiving the call data. Equivalent to `to` in a normal transaction.
- `value`: `bigint` - Optionally, the amount of native token to send. Equivalent to `value` in a normal transaction.
- `data`: `string` - The call data or "0x" if empty. Equivalent to `data` in a normal transaction.
