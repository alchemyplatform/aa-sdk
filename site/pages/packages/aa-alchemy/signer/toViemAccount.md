---
title: Alchemy Signer • toViemAccount
description: Learn how to use the AlchemySigner.toViemAccount method
---

# toViemAccount

The `toViemAccount` method is used to adapt the AlchemySigner into a viem [`WalletClient`](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc) compatible `LocalAccoun`. This is particularly useful if you are already using viem and want to use the signer as an EOA.

:::warning
This method throws if there is no authenticated user.
:::

## Usage

:::code-group

```ts [example.ts]
import { signer } from "./signer";

const account = signer.toViemAccount();
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Returns

`LocalAccount` -- on success returns a viem `LocalAccount`.
