---
outline: deep
head:
  - - meta
    - property: og:title
      content: MagicSigner • signTypedData
  - - meta
    - name: description
      content: Overview of the signTypedData method on MagicSigner
  - - meta
    - property: og:description
      content: Overview of the signTypedData method on MagicSigner
---

# signTypedData

`signTypedData` supports signing typed data from the `MagicSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/magic/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createMagicSigner } from "./magic";
// [!code focus:99]
const magicSigner = await createMagicSigner();

const signedTypedData = await magicSigner.signTypedData({
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

<<< @/snippets/magic.ts
:::

## Returns

### `Promise<Hex>`

A Promise containing the signature of the typed data.

## Parameters

### `params: SignTypedDataParams` -- the typed data to sign

- `domain: TypedDataDomain` -- The typed data domain
- `types: Object` -- the type definitions for the typed data
- `primaryType: inferred String` -- the primary type to extract from types and use in value
- `message: inferred from types & primaryType` -- the message, inferred from
