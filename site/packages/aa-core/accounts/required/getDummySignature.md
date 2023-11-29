---
outline: deep
head:
  - - meta
    - property: og:title
      content: getDummySignature
  - - meta
    - name: description
      content: Overview of the getDummySignature abstract method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the getDummySignature abstract method on BaseSmartContractAccount
---

# getDummySignature

This method should return a signature that will not `revert` during validation. It does not have to pass validation, just not cause the contract to revert. This is required for gas estimation so that the gas estimate are accurate.

Please note that the dummy signature is specific to the account implementation and the example dummy signature below does not generalize to all account types. This is an example dummy signature for SimpleAccount account implementation. For other account implementations, you may need to provide a different dummy signature.

**Reference:**

- [Our Bundler API docs](https://docs.alchemy.com/reference/eth-estimateuseroperationgas#dummy-signature-for-simpleaccount)
- [EIP-4337: `eth_estimateUserOperationGas`](https://eips.ethereum.org/EIPS/eip-4337#-eth_estimateuseroperationgas)

## Example Implementation

::: code-group

```ts [example.ts]
// [!code focus:99]
getDummySignature(): `0x${string}` {
  return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
}
```

:::

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const dummySignature = await provider.getDummySignature();
```

<<< @/snippets/provider.ts

:::

## Returns

### `Hash`

A dummy signature that doesn't cause the account to revert during estimation
