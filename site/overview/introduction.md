---
outline: deep
head:
  - - meta
    - property: og:title
      content: Introduction
  - - meta
    - name: description
      content: Learn what Account Kit is, how it works, and how you can use it to add support for smart accounts.
  - - meta
    - property: og:description
      content: Learn what Account Kit is, how it works, and how you can use it to add support for smart accounts.
  - - meta
    - name: twitter:title
      content: Introduction
  - - meta
    - name: twitter:description
      content: Learn what Account Kit is, how it works, and how you can use it to add support for smart accounts.
---

# What is Account Kit?

**Account Kit** is a framework to embed smart accounts in your web3 app, unlocking [powerful features](/overview/getting-started) like email/social login, gas sponsorship, batched transactions, and more. The `aa-sdk` makes it easy to integrate and deploy smart accounts, send user operations, and sponsor gas with just a few lines of code.

## What is the Account Kit stack?

Account Kit is a complete solution for [account abstraction](https://www.alchemy.com/overviews/what-is-account-abstraction). It includes five components:

- **aa-sdk**: A simple, powerful interface to integrate, deploy, and use smart accounts. The `aa-sdk` orchestrates everything under the hood to make development easy.
- **Light Account:** Secure, audited smart accounts. Easy to deploy, just when your users need them.
- **Signer:** Integrations with the most popular wallet providers. Secure your accounts with email, social login, passkeys, or a self-custodial wallet Signer.
- **Gas Manager API:** A programmable API to sponsor gas for UserOps that meet your criteria.
- **Bundler API:** The most reliable ERC-4337 Bundler. Land your UserOps onchain, batch operations, and sponsor gas at massive scale.

<img src="/images/account-kit-overview.png" width="400" height="auto" alt="Account Kit Overview" style="display: block; margin: auto;">

Let’s dive into each component.

### aa-sdk

The `aa-sdk` is a type-safe and performant TypeScript library built on top of [viem](https://viem.sh/) to provide ergonomic methods for sending user operations, sponsoring gas, and deploying smart accounts. It handles all the complexity of ERC-4337 under the hood to make account abstraction simple.

The SDK also implements an EIP-1193 provider interface to easily plug into any popular dapp or wallet connect libraries such as RainbowKit, Wagmi, and Web3Modal. It also includes ethers.js adapters to provide full support for ethers.js apps.

The `aa-sdk` is modular at every layer of the stack and can be easily extended to fit your custom needs. You can plug in any [smart account](/smart-accounts/accounts/using-your-own) implementation, [Signer](/smart-accounts/signers/choosing-a-signer), Gas Manager API, RPC provider.

Get started with `aa-sdk` in our [Getting Started guide](/overview/getting-started) or checkout the [open source repo](https://github.com/alchemyplatform/aa-sdk).

### Light Account

`LightAccount` is a secure, gas-optimized, ERC-4337 smart account.

We started with the Ethereum Foundation’s canonical [SimpleAccount](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) and added key improvements for production app development:

- Significantly [reduced gas costs](/smart-accounts/accounts/choosing-a-smart-account#benchmarks)
- ERC-1271 signature support to ensure users can sign messages, such as on Opensea
- Ownership transfer so that users won’t get locked into a single Signer

`LightAccount` was audited by Quantstamp ([report](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf)).

`LightAccount` is forward-compatible with [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900), a new standard for **modular** smart accounts. Once we stabilize the ERC with the [community](https://ethereum-magicians.org/t/erc-6900-modular-smart-contract-accounts-and-plugins/13885/35) and publish a reference implementation, we will release an optional upgrade for `LightAccount` to upgrade to modular EIP-6900 compliant accounts. [Join the discussion](https://ethereum-magicians.org/t/erc-6900-modular-smart-contract-accounts-and-plugins/13885/35) on ERC-6900!

To learn how to deploy a `LightAccount`, see [Light Account](/smart-accounts/accounts/light-account).

### Signers

A Signer is responsible for securely managing the private key and signing transaction requests on the smart account. Account Kit supports many popular wallet signers including [Magic](/smart-accounts/signers/magic), [web3auth](/smart-accounts/signers/web3auth), [Turnkey](/smart-accounts/signers/turnkey), [Privy](/smart-accounts/signers/privy), [Dynamic](/smart-accounts/signers/dynamic), [Fireblocks](/smart-accounts/signers/fireblocks), [Portal](/smart-accounts/signers/portal), [Capsule](/smart-accounts/signers/capsule), [Lit Protocol](/smart-accounts/signers/lit) and [Arcana Auth](/smart-accounts/signers/arcana-auth). It also supports self-custodial wallets like MetaMask or Ledger.

To get started with a Signer, read the doc: [How to Choose a Signer](/smart-accounts/signers/choosing-a-signer).

### Gas Manager API

The Gas Manager is a programmable API to sponsor gas for UserOps. You can create programmable gas policies to specify exactly which transactions should be sponsored, set strict spending limits per wallet or globally, and allowlist/blocklist particular wallet addresses. This expressive programmability is available through a REST API and an intuitive dashboard interface.

To learn how to sponsor gas with the Gas Manager API, see the [Sponsoring Gas](/guides/sponsoring-gas/sponsoring-gas) tutorial.

### Bundler API

The Bundler is a mission-critical piece of secondary infrastructure defined in the ERC-4337 spec that is responsible for submitting UserOps from a smart account onchain. If your Bundler API is unreliable, then User Operations are going to fail or get stuck.

We built our [Bundler in Rust](https://www.alchemy.com/blog/open-sourcing-rundler) to handle the highest loads at production scale. It’s able to handle massive scale because we operate it alongside our fleet of nodes powering the biggest dapps in web3 from Opensea to Circle.

Check out the open source code in our affectionately named [Rundler github repo](https://github.com/alchemyplatform/rundler).

## Start building with Account Kit

Account Kit was designed from the ground up to make account abstraction easy. It’s built on top of industry-leading infrastructure that powers applications at massive scale from Opensea to Shopify. Start integrating Account Kit today in the [Getting Started guide](/overview/getting-started).
