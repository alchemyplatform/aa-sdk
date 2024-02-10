---
outline: deep
head:
  - - meta
    - property: og:title
      content: Privy Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use Privy as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Follow this integration guide to use Privy as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: Privy Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use Privy as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Privy Integration Guide

[Privy](https://privy.io) is an easy way for you to onboard users across mobile and desktop, regardless of whether they already have a wallet or not.

With Privy, you can easily provision **self-custodial embedded wallets** for your users when they login with email, SMS, or social logins, while also enabling web3-native users to use their existing wallets with your app, if they prefer.

Combining Privy with Account Kit allows you to seamlessly generate embedded wallets for your users and supercharge these wallets with account abstraction – setting the foundation for an innovative & delightful onchain experience.

## Integration

### Install the SDK

::: code-group

```bash [npm]
npm i @privy-io/react-auth
```

```bash [yarn]
yarn add @privy-io/react-auth
```

:::

### Create a SmartAccountSigner

First, set up your React app with Privy following the [Privy Quickstart](https://docs.privy.io/guide/quickstart). You should also configure your `PrivyProvider` to create embedded wallets for your users when they login, like below:

```ts [PrivyProvider]

<PrivyProvider
    appId='insert-your-privy-app-id'
    config={{
        ...insertYourPrivyProviderConfig,
        embeddedWallets: {
            createOnLogin: 'all-users'
        }
    }}
>

```

Then, when a user logs in to your app, Privy will create an embedded wallet for them. You can use this embedded wallet to create a `LightSmartContractAccount` from `aa-accounts`:

<<< @/snippets/signers/privy.ts
