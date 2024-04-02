---
outline: deep
head:
  - - meta
    - property: og:title
      content: Overview
  - - meta
    - name: description
      content: Learn what Account Kit is, how it works, and how you can use it to integrate smart accounts in your app.
  - - meta
    - property: og:description
      content: Learn what Account Kit is, how it works, and how you can use it to integrate smart accounts in your app.
  - - meta
    - name: twitter:title
      content: Overview
  - - meta
    - name: twitter:description
      content: Learn what Account Kit is, how it works, and how you can use it to integrate smart accounts in your app.
---

# Why Account Kit?

Onboarding to web3 should be as easy as a web2 app. Traditional wallets make you jump through hoops like downloading an extension, backing up a seed phrase, and funding a wallet with ETH.

Each of these steps adds friction. As a result, most new users drop off before they ever reach the magic moment in your app! We need to make wallets, seed phrases, and gas costs disappear to onboard the next billion users.

Account Kit makes it easy to onboard users with smart accounts -- account abstraction wallets embedded directly in your app with seamless UX. Account Kit unlocks:

**Your app, your UX:** Design every step of the user experience natively in your app, from signup to checkout.

- **Familiar, secure login:** Streamline your sign-up flow with custom [authentication methods](/signers/choosing-a-signer), including email, social login, SMS, biometrics, passkeys, or self-custodial signers like Metamask.
- **Sponsor gas:** enable users to transact without gas by [sponsoring gas](/using-smart-accounts/sponsoring-gas/gas-manager) fees through an ERC-4337 paymaster.
- **Batch transactions:** streamline multi-step flows into a single transaction by [batching actions](/using-smart-accounts/batch-user-operations) in a UserOp to the Bundler API.
- **Delightful developer experience:** Account Kit is built on Viem and fully compatible with ethers.js and the EIP-1193 interface to make integration a breeze.

# What is Account Kit?

**Account Kit** provides all the tools you need to build smart accounts in your web3 app, unlocking powerful features like social login, gas sponsorship, and batched transactions. Integrate [account abstraction](https://www.alchemy.com/overviews/what-is-account-abstraction/?a=embedded-accounts-get-started) with just a few lines of code to deploy your first smart accounts and start sending user operations!

Account Kit includes five components:

- **aa-sdk**: A simple, powerful interface to integrate, deploy, and use smart accounts. The `aa-sdk` orchestrates everything under the hood to make development easy.
- **Modular Account:** Secure, audited, modular smart accounts. It is easy to deploy when your users need them and extend with [EIP-6900](https://eips.ethereum.org/EIPS/eip-6900) plugins.
- **Signer:** Integrations with the most popular wallet providers. Secure your accounts with email, social login, passkeys, or a self-custodial wallet Signer.
- **Gas Manager API:** A programmable API to sponsor gas for UserOps that meets your criteria.
- **Bundler API:** The most reliable ERC-4337 Bundler. Land your UserOps on-chain, batch operations, and sponsor gas at a massive scale.

<img src="/images/account-kit-overview.png" width="400" height="auto" alt="Account Kit Overview" style="display: block; margin: auto;">

Let's dive into each component.

## aa-sdk

The `aa-sdk` is a type-safe and performant TypeScript library built on top of [viem](https://viem.sh/) to provide ergonomic methods for sending user operations, sponsoring gas, and deploying smart accounts. It handles all the complexity of ERC-4337 under the hood to simplify account abstraction.

The SDK also implements an EIP-1193 provider interface to easily plug into popular dApps or WalletConnect libraries such as RainbowKit, Wagmi, and Web3Modal. It also includes ethers.js adapters to provide full support for ethers.js apps.

The `aa-sdk` is modular at every layer of the stack and can be easily extended to fit your custom needs. You can plug in any [smart account](/smart-accounts/custom/using-your-own) implementation, [Signer](/signers/choosing-a-signer), Gas Manager API, RPC provider.

Get started with `aa-sdk` in our [Getting started](/getting-started/introduction) guide or checkout the [open-source repo](https://github.com/alchemyplatform/aa-sdk).

## Modular Account

`ModularAccount` is a secure, audited, and modular ERC-4337 smart account.

- **Purpose built for AA:** modular account was designed and optimized for ERC-4337 account abstraction. It works seamlessly with the Entrypoint contract, Bundlers, and Paymasters.
- **Extensible:** modular account is the first [EIP-6900](https://eips.ethereum.org/EIPS/eip-6900) account, making it infinitely extensible with custom plugins. Plug and play from a selection of existing plugins, including session keys and account recovery, or write your own to customize the account for your app.
- **Secure:** modular account was developed by Alchemy and audited by both [Spearbit](https://github.com/alchemyplatform/modular-account/blob/develop/audits/2024-01-31_spearbit_0e3fd1e.pdf) and [Quantstamp](https://github.com/alchemyplatform/modular-account/blob/develop/audits/2024-02-20-quantstamp-8ae319e.pdf).

<!--@include: ../resources/bbp.md-->

## Signers

A Signer is responsible for securely managing the private key and signing transaction requests on the smart account. Account Kit supports many popular wallet signers. It also supports self-custodial wallets like MetaMask or Ledger.

To get started with a Signer, read the doc: [Choosing a Smart Account](/signers/choosing-a-signer).

## Gas Manager API

The Gas Manager is a programmable API to sponsor gas for UserOps. You can create programmable gas policies to specify exactly which transactions should be sponsored, set strict spending limits per wallet or globally, and allow/blocklist particular wallet addresses. This expressive programmability is available through a REST API and an intuitive dashboard interface.

To learn how to sponsor gas with the Gas Manager API, see the [Sponsoring gas](/using-smart-accounts/sponsoring-gas/gas-manager) tutorial.

## Bundler API

The Bundler submits UserOps from a smart account and executes them onchain. This is a mission-critical operation: if your Bundler is unreliable, then transactions are going to fail or get stuck.

We built our [Bundler in Rust](https://www.alchemy.com/blog/open-sourcing-rundler/?a=embedded-accounts-get-started) to handle the highest loads at production scale. It's able to handle massive scale because we operate it alongside our fleet of nodes powering the biggest dapps in web3 from Opensea to Circle.

Check out the open source code in our affectionately named [Rundler github repo](https://github.com/alchemyplatform/rundler).

# Start building with Account Kit

Account Kit was designed from the ground up to make account abstraction easy. It's built on top of industry-leading infrastructure that powers applications at massive scale from Opensea to Shopify.

Next, read the [Quick start](/getting-started/introduction) guide to get setup in minutes!
