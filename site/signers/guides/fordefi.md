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

# Fordefi Integration Guide

[Fordefi](https://fordefi.com) is a blockchain security company that provides an **institutional-grade MPC (Multi-Party Computation)
non-custodial wallet** specifically built for decentralized finance (DeFi).

Fordefi focuses on enhancing the security and efficiency of transactions in the DeFi space through the innovative use of MPC technology
for key management and transaction signing,
and by providing a secure and user-friendly interface through various clients:

1. [Fordefi Browser Extension](https://chromewebstore.google.com/detail/fordefi/hcmehenccjdmfbojapcbcofkgdpbnlle) for interaction with dApps.
2. [Fordefi Web Console](https://app.fordefi.com) for securely performing administrative operations such as setting up transaction policy
   rules and user management, which require approvals by a quorum of administrators.
3. [Fordefi API](https://docs.fordefi.com/reference/api-overview) for developers to interact with the Fordefi infrastructure.

Read more about Fordefi on the [site](https://fordefi.com) and [docs](https://docs.fordefi.com).

Combining Fordefi with Account Kit allows you to get the best of both worlds.
You can use Fordefi via the [`aa-signers`](/packages/aa-signers/index) package to generate a wallet scoped to your application,
and then use [`aa-alchemy`](/packages/aa-alchemy/index) to create smart accounts for your users.

## Integration

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

const signer = await createFordefiSigner();
const provider = await createModularAccountAlchemyClient({
  apiKey: "ALCHEMY_API_KEY",
  chain,
  signer,
});
```

<<< @/snippets/signers/fordefi.ts

:::
