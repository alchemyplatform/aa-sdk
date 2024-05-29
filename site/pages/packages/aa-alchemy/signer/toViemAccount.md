---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • toViemAccount
  - - meta
    - name: description
      content: Learn how to use the AlchemySigner.toViemAccount method
  - - meta
    - property: og:description
      content: Learn how to use the AlchemySigner.toViemAccount method
  - - meta
    - name: twitter:title
      content: Alchemy Signer • toViemAccount
  - - meta
    - name: twitter:description
      content: Learn how to use the AlchemySigner.toViemAccount method
---

# toViemAccount

The `toViemAccount` method is used to adapt the AlchemySigner into a viem [`WalletClient`](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc) compatible `LocalAccoun`. This is particularly useful if you are already using viem and want to use the signer as an EOA.

:::warning
This method throws if there is no authenticated user.
:::

## Usage

:::code-group

```ts
import { signer } from "./signer";

const account = signer.toViemAccount();
```

<<< @/snippets/signers/alchemy/signer.ts

:::

## Returns

`LocalAccount` -- on success returns a viem `LocalAccount`.
