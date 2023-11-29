---
outline: deep
head:
  - - meta
    - property: og:title
      content: signTypedDataWith6492
  - - meta
    - name: description
      content: Overview of the signTypedDataWith6492 method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the signTypedDataWith6492 method on BaseSmartContractAccount
next:
  text: Other Methods
---

# signTypedDataWith6492

Similar to the signMessageWith6492 method above, this method wraps the result of `signTypedData` as per [EIP-6492](https://eips.ethereum.org/EIPS/eip-6492) to support signing the typed data for deployed smart accounts, as well as undeployed accounts (counterfactual addresses).

**Note**: This method is already implemented on `BaseSmartContractAccount`, so any class that extends and implements `BaseSmartContractAccount` may call this method.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const signedTypedDataWrappedWith6492 = provider.signTypedDataWith6492({
  domain: {
    name: "Ether Mail",
    version: "1",
    chainId: 1,
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  },
  types: {
    Person: [
      { name: "name", type: "string" },
      { name: "wallet", type: "address" },
    ],
    Mail: [
      { name: "from", type: "Person" },
      { name: "to", type: "Person" },
      { name: "contents", type: "string" },
    ],
  },
  primaryType: "Mail",
  message: {
    from: {
      name: "Cow",
      wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
    },
    to: {
      name: "Bob",
      wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    },
    contents: "Hello, Bob!",
  },
});
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<Hex>`

A promise containing the signature of the message, additionally wrapped in EIP-6492 format if the account is undeployed

## Parameters

### `params: SignTypedDataParams`

The typed data to sign

- `domain: TypedDataDomain` -- The typed data domain
- `types: Object` -- The type definitions for the typed data
- `primaryType: inferred String` -- The primary type to extract from types and use in value
- `message: inferred from types & primaryType` -- The typed message object
