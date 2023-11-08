---
outline: deep
head:
  - - meta
    - property: og:title
      content: encodeExecute
  - - meta
    - name: description
      content: Overview of the encodeExecute abstract method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the encodeExecute abstract method on BaseSmartContractAccount
next:
  text: Optional Methods
---

# encodeExecute

Returns the abi encoded function data for a call to your contract's `execute` method.

## Example Implementation

::: code-group

```ts [example.ts]
import { SimpleAccountAbi } from "./simple-account-abi";
// [!code focus:99]
async encodeExecute(
  target: Hex,
  value: bigint,
  data: Hex
): Promise<`0x${string}`> {
  return encodeFunctionData({
    abi: SimpleAccountAbi,
    functionName: "execute",
    args: [target, value, data],
  });
}
```

<<< @/snippets/simple-account-abi.ts
:::

## Returns

### `Promise<Hex>`

The promise containing the abi encoded function data for a call to your contract's `execute` method

## Parameters

`UserOperationCallData` fields:

- `target`: `string` - The address receiving the call data. Equivalent to `to` in a normal transaction.
- `value`: `bigint` - Optionally, the amount of native token to send. Equivalent to `value` in a normal transaction.
- `data`: `string` - The call data or "0x" if empty. Equivalent to `data` in a normal transaction.
