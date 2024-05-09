---
outline: deep
head:
  - - meta
    - property: og:title
      content: Fordefi Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use Fordefi as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Follow this integration guide to use Fordefi as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: Fordefi Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use Fordefi as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Fordefi

[Fordefi](https://www.fordefi.com)'s technology allows you to create and manage self-custody MPC wallets.

# Integration

### Install the Fordefi Web3 Provider

Using `FordefiSigner` in the `aa-signers` package requires installation of the [`@fordefi/web3-provider`](https://github.com/FordefiHQ/web3-provider) SDK. `aa-signers` lists it as optional dependency.

::: code-group

```bash [npm]
npm i -s @fordefi/web3-provider
```

```bash [yarn]
yarn add @fordefi/web3-provider
```

:::

### Create a SmartAccountSigner

Next, setup the Fordefi Web3 Provider and create a `SmartAccountSigner` using the `aa-signers` package:

<<< @/snippets/signers/fordefi.ts

### Use it with Modular Account

Let's see it in action with `aa-alchemy`:

::: code-group

```ts [example.ts]
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { createFordefiSigner } from "./fordefi";

const chain = sepolia;

const provider = await createModularAccountAlchemyClient({
  apiKey: "ALCHEMY_API_KEY",
  chain,
  signer: await createFordefiSigner(),
});
```

<<< @/snippets/signers/fordefi.ts

:::
