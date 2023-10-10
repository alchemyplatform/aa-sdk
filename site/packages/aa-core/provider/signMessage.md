---
outline: deep
head:
  - - meta
    - property: og:title
      content: ISmartAccountProvider • signMessage
  - - meta
    - name: description
      content: Overview of the signMessage method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the signMessage method on ISmartAccountProvider
---

# signMessage

This method signs messages using the connected account with [ERC-191](https://eips.ethereum.org/EIPS/eip-191) standard.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const signedMessage = await provider.signMessage("msg");
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<Hash>`

The signed hash for the message passed

## Parameters

### `msg: string | Uint8Array`

Message to be signed
