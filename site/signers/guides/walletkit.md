---
outline: deep
head:
  - - meta
    - property: og:title
      content: WalletKit Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use WalletKit as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this integration guide to use WalletKit as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: WalletKit Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use WalletKit as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# WalletKit Integration Guide

![WalletKit](/images/walletkit-overview.png)

[WalletKit](https://walletkit.com) supports smart wallets, EOA wallets, and pre-built components for onboarding users
with email and social logins. You can integrate WalletKit's pre-built components in under 15 minutes using their React
SDK or the wagmi connector. Or, if you prefer, build your own unique experiences for your users using WalletKit's
Wallets API.

This guide shows you how to use WalletKit's EOA wallets and pre-built onboarding components with Account Kit.

## Integration

### Install the SDK

::: code-group

```bash [npm]
npm i @walletkit/react-link walletkit-js
```

```bash [yarn]
yarn add @walletkit/react-link walletkit-js
```

:::

### Setup WalletKit

Initialize `WalletKitLink` with your Project ID and wrap your app with `WalletKitProvider`, adding it as close to the
root as possible.

You can get your Project ID from the API Keys page in the [WalletKit dashboard](https://app.walletkit.com).

```ts
import { WalletKitLink, WalletKitLinkProvider } from "@walletkit/react-link";

const wkLink = new WalletKitLink({
  projectId: "<WalletKit-Project-ID>",

  // WalletKit defaults to smart contract based wallets.
  // In this case, we want to create an EOA wallet.
  walletType: "eoa",
});

export function App() {
  return <WalletKitLinkProvider link={wkLink}>...</WalletKitLinkProvider>;
}
```

::: tip

If you'd like to integrate WalletKit with wagmi, check out
the [installation docs here](https://docs.walletkit.com/link/installation).

:::

### Create a SmartAccountSigner

Use the ethereum provider from WalletKit to create a `WalletClientSigner`.

```ts
import { useWalletKitLink, type WalletKitLink } from "@walletkit/react-link";

const walletKit: WalletKitLink = useWalletKitLink();

// Prompt the user to create an EOA wallet using their email or social login.
// Returns the EOA account address. We will use this account as the signer.
const account = await walletKit.connect();

// Create a WalletClientSigner using a wallet client with WalletKit as
// the custom transport.
const signer: SmartAccountSigner = new WalletClientSigner(
  createWalletClient({
    account: account as `0x${string}`,
    chain: sepolia,
    transport: custom(walletKit.ethereumProvider),
  }),
  "walletKit"
);
```

### Configure AlchemyProvider

Finally, create `AlchemyProvider` using the signer we just created as the owner of the smart contract wallet.

```ts
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";

const client = await createModularAccountAlchemyClient({
  apiKey: "<Alchemy-API-Key>",
  chain: sepolia,
  owner: signer,
});
```
