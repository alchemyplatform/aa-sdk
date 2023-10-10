---
outline: deep
head:
  - - meta
    - property: og:title
      content: signTypedData
  - - meta
    - name: description
      content: Overview of the signTypedData method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the signTypedData method on BaseSmartContractAccount
---

# signTypedData

If your contract supports signing and verifying typed data, you should implement this method that returns the signed typed data object as per [ERC-712](https://eips.ethereum.org/EIPS/eip-712).

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
// sign typed data
const signedTypedData = provider.signTypedData({
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

### Returns

### `Promise<Hash>`

A promise containing the signature of the typed data.

## Parameters

### `SignTypedDataParams`

The typed data to sign

- `domain: TypedDataDomain` - The typed data domain
- `types: Object` -- The type definitions for the typed data
- `primaryType: inferred String` -- The primary type to extract from types and use in value
- `message: inferred from types & primaryType` -- The typed message object
