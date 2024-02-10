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

It’s way too hard for new users to start using web3 apps. They have to jump through hoops like downloading an extension, backing up a seed phrase, funding their wallet with ETH to pay gas, and signing a transaction.

Each of these steps adds friction. As a result, most new users drop off before they ever reach the magic moment in your app! We need to make wallets, seed phrases, and gas costs disappear in order to onboard the next billion users.

Account Kit makes it easy onboard users with smart accounts -- account abstraction wallets embedded directly in your app with seamless UX. Account Kit unlocks:

- **Your app, your UX:** design every step of the user experience from signup to checkout natively in your app.
- **Familiar, secure login:** Streamline your sign up flow with custom [authentication methods](/signers/choosing-a-signer) including email, social login, SMS, biometrics, passkeys, or self-custodial signers like Metamask.
- **Sponsor gas:** enable users to transact with no gas by [sponsoring gas](/using-smart-accounts/sponsoring-gas/gas-manager) fees through an ERC-4337 paymaster.
- **Batch transactions:** streamline multi-step flows into a single transaction by [batching actions](/using-smart-accounts/batch-user-operations) in a UserOp to the Bundler API.
- **Delightful developer experience:** Account Kit is built on Viem and fully compatible with ethers.js and the EIP-1193 interface to make integration a breeze.

# What is Account Kit?

**Account Kit** is a toolkit to embed smart accounts in your web3 app, unlocking powerful features like social login, gas sponsorship, and batched transactions. Integrate [account abstraction](https://www.alchemy.com/overviews/what-is-account-abstraction/?a=ak-docs) with just a few lines of code to deploy your first smart accounts and start sending user operations!

Account Kit includes five components:

- **aa-sdk**: A simple, powerful interface to integrate, deploy, and use smart accounts. The `aa-sdk` orchestrates everything under the hood to make development easy.
- **Modular Account:** Secure, audited, modular smart accounts. Easy to deploy just when your users need them, and easy to extend with [EIP-6900](https://eips.ethereum.org/EIPS/eip-6900) plugins.
- **Signer:** Integrations with the most popular wallet providers. Secure your accounts with email, social login, passkeys, or a self-custodial wallet Signer.
- **Gas Manager API:** A programmable API to sponsor gas for UserOps that meet your criteria.
- **Bundler API:** The most reliable ERC-4337 Bundler. Land your UserOps onchain, batch operations, and sponsor gas at massive scale.

<img src="/images/account-kit-overview.png" width="400" height="auto" alt="Account Kit Overview" style="display: block; margin: auto;">

Let’s dive into each component.

## aa-sdk

The `aa-sdk` is a type-safe and performant TypeScript library built on top of [viem](https://viem.sh/) to provide ergonomic methods for sending user operations, sponsoring gas, and deploying smart accounts. It handles all the complexity of ERC-4337 under the hood to make account abstraction simple.

The SDK also implements an EIP-1193 provider interface to easily plug into any popular dapp or wallet connect libraries such as RainbowKit, Wagmi, and Web3Modal. It also includes ethers.js adapters to provide full support for ethers.js apps.

The `aa-sdk` is modular at every layer of the stack and can be easily extended to fit your custom needs. You can plug in any [smart account](/smart-accounts/custom/using-your-own) implementation, [Signer](/signers/choosing-a-signer), Gas Manager API, RPC provider.

Get started with `aa-sdk` in our [Getting Started guide](/getting-started/setup) or checkout the [open source repo](https://github.com/alchemyplatform/aa-sdk).

## Light Account

`ModularAccount` is a secure, audited, and modular ERC-4337 smart account.

- **Purpose built for AA:** modular account was designed and optimized for ERC-4337 account abstraction. It works seamlessly with the entrypoint contract, bundlers, and paymasters.
- **Extensible:** modular account is the first [EIP-6900](https://eips.ethereum.org/EIPS/eip-6900) account, making it infinitely extensible with custom plugins. Plug and play from a selection of existing plugins including session keys and account recovery, or write your own to customize the account for your app.
- **Secure:** modular account was developed by Alchemy and audited by both Spearbit and Quantstamp.

## Signers

A Signer is responsible for securely managing the private key and signing transaction requests on the smart account. Account Kit supports many popular wallet signers. It also supports self-custodial wallets like MetaMask or Ledger.

To get started with a Signer, read the doc: [How to Choose a Signer](/signers/choosing-a-signer).

## Gas Manager API

The Gas Manager is a programmable API to sponsor gas for UserOps. You can create programmable gas policies to specify exactly which transactions should be sponsored, set strict spending limits per wallet or globally, and allowlist/blocklist particular wallet addresses. This expressive programmability is available through a REST API and an intuitive dashboard interface.

To learn how to sponsor gas with the Gas Manager API, see the [Sponsoring Gas](/using-smart-accounts/sponsoring-gas/gas-manager) tutorial.

## Bundler API

The Bundler submits UserOps from a smart account and executes them onchain. This is a mission-critical operation: if your Bundler is unreliable, then transactions are going to fail or get stuck.

We built our [Bundler in Rust](https://www.alchemy.com/blog/open-sourcing-rundler/?a=ak-docs) to handle the highest loads at production scale. It’s able to handle massive scale because we operate it alongside our fleet of nodes powering the biggest dapps in web3 from Opensea to Circle.

Check out the open source code in our affectionately named [Rundler github repo](https://github.com/alchemyplatform/rundler).

# Start building with Account Kit

Account Kit was designed from the ground up to make account abstraction easy. It’s built on top of industry-leading infrastructure that powers applications at massive scale from Opensea to Shopify.

Next, read the [Quick Start guide](/getting-started/setup) to get setup in minutes!
