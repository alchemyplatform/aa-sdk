---
outline: deep
head:
  - - meta
    - property: og:title
      content: Turnkey Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use Turnkey as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this integration guide to use Turnkey as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Turnkey Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use Turnkey as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Turnkey Integration Guide

[Turnkey](https://turnkey.com) is secure, non-custodial wallet infrastructure that allows users to generate wallets scoped to your application via Email or WebAuthn. Turnkey leverages secure enclaves and a proprietary policy engine; this novel security architecture ensures that key material is only decrypted within an enclave and any signing is governed by your application's policies. This is great for enabling a secure, flexible experience for your users that can be powerfully enhanced by the benefits of Account Abstraction (gas sponsorship, batching, etc).

Combining Turnkey with Account Kit allows you to create a magical UX for your users. Use Turnkey via the [`aa-signers`](/packages/aa-signers/turnkey/introduction) package to generate embedded wallets at scale, and then leverage [`aa-alchemy`](/packages/aa-alchemy/index) to create smart accounts for your users!

## Integration

### Create a Turnkey Account

Create an account and API keys on [Turnkey's Dashboard](https://app.turnkey.com/).

### Install the SDK

Using `TurnkeySigner` in the `aa-signers` package requires installation of the [`@turnkey/http`](https://github.com/tkhq/sdk/tree/main/packages/http) and [`@turnkey/viem`](https://github.com/tkhq/sdk/tree/main/packages/viem) dependencies. `aa-signers` lists them as optional dependencies.

Every request to Turnkey must be signed using a [stamper](https://docs.turnkey.com/category/api-design). Turnkey supports multiple stampers including [`@turnkey/webauthn-stamper`](https://github.com/tkhq/sdk/tree/main/packages/webauthn-stamper) to sign requests with Passkeys or WebAuthn devices, [`@turnkey/iframe-stamper`](https://github.com/tkhq/sdk/tree/main/packages/iframe-stamper) with Email, and [`@turnkey/api-key-stamper`](https://github.com/tkhq/sdk/tree/main/packages/api-key-stamper) with API keys.

::: code-group

```bash [npm]
npm i -s @turnkey/http
npm i -s @turnkey/viem
```

```bash [yarn]
yarn add @turnkey/http
yarn add @turnkey/viem
```

:::

### Create a TurnkeySigner

Next, setup the Turnkey SDK and create an authenticated `TurnkeySigner` using the `aa-signers` package:

<<< @/snippets/turnkey.ts

### Use it with Light Account

Let's see it in action with `aa-alchemy` and `LightSmartContractAccount` from `aa-accounts`:
::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { sepolia } from "@alchemy/aa-core";
import { createTurnkeySigner } from "./turnkey";

const chain = sepolia;

const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY",
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress,
      chain: rpcClient.chain,
      owner: await createTurnkeySigner(),
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
    })
);
```

<<< @/snippets/turnkey.ts

:::
