---
outline: deep
head:
  - - meta
    - property: og:title
      content: signMessage
  - - meta
    - name: description
      content: Overview of the signMessage abstract method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the signMessage abstract method on BaseSmartContractAccount
---

# signMessage

This method should return an [ERC-191](https://eips.ethereum.org/EIPS/eip-191) compliant message and is used to sign `UserOperation` hashes.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const signedMessage = await provider.signMessage("msg");
```

<<< @/snippets/provider.ts

:::

### Returns

### `Promise<Hex>`

A promise containing the signature of the message

## Parameters

### `msg`: `string | Uint8Array | Hex`

The message to sign
