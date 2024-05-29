---
outline: deep
title: Overview
description: Build Embedded Accounts with Account Kit. Build smart accounts powered by Account Abstraction (ERC-4337).
---

# Why Embedded Accounts?

Web3 onboarding should be as simple as web2 sign up.

With traditional wallets, your users have to download an extension, back up a seed phrase, and fund a wallet with ETH. Each of these steps adds friction and cause new users to drop off before they reach the magic moment in your app!

**Embedded Accounts** make wallets invisible. Sign up for a non-custodial web3 account with no downloads, transact without gas, and recover without a seed phrase. Bring the next billion users onchain with embedded accounts.

- **Your app, your UX:** Design every step natively in your app, from sign up to checkout.
- **Familiar auth methods:** Sign up with email, social login, passkeys (i.e. biometrics), or self-custodial signers like Metamask.
- **Sponsor gas:** increase engagement by [sponsoring gas](/using-smart-accounts/sponsoring-gas/gas-manager) fees through an ERC-4337 paymaster.
- **Batch transactions:** streamline multi-step actions like approve+swap in a single transaction by [batching](/using-smart-accounts/batch-user-operations) with the Bundler API.
- **Account recovery:** Never lose your keys again. Embedded accounts support private key export, email recovery, and onchain recovery plugins.

# Built with Account Kit

Embedded Accounts are built with **Account Kit**: a simple and powerful toolkit to build next-gen wallets with [Account Abstraction](https://www.youtube.com/watch?v=Vpk_MhY-EeE). It also supports lightweight [EOA accounts](/signers/alchemy-signer/introduction#using-the-signer-as-an-eoa) if you prefer, but AA unlocks superpowers like gas sponsorship, batch transactions, and more.

Account Kit provides all the tools you need to build invisible web3 accounts. It includes:

- **AA SDK**: A simple SDK to integrate and customize embedded accounts in your app. The `aa-sdk` orchestrates everything from wallet creation to authentication, transaction signing, gas sponsorship, and more.
- **Signer API:** A secure, non-custodial Signer API to generate and store private keys, powered by Alchemy and [Turnkey](https://www.turnkey.com/). You can also [bring your own signer](/signers/choosing-a-signer) solution.
- **Smart Contract Accounts:** Smart contract accounts designed from the ground up for ERC-4337, extensibility through [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900), and low gas costs.
- **Gas Manager API:** A programmable API to sponsor gas for UserOps that meet your criteria.
- **Bundler API:** The most reliable ERC-4337 Bundler. Land your UserOps on-chain, batch operations, and sponsor gas at a massive scale.

<img src="/images/account-kit-overview.jpg" width="400" height="auto" alt="Account Kit Overview" style="display: block; margin: auto;">

Let's dive into each component.

## aa-sdk

The `aa-sdk` is a type-safe and performant TypeScript library built on top of [viem](https://viem.sh/) and fully compatible with ethers.js. It provides ergonomic methods for sending user operations, sponsoring gas, deploying smart accounts, and much more. It handles all the complexity of ERC-4337 under the hood to simplify your development.

The SDK implements an EIP-1193 provider interface so embedded accounts can drop right into popular app frameworks and wallet connect libraries like RainbowKit, Wagmi, and Web3Modal. It also includes ethers.js adapters to provide full support for ethers.js apps.

Get started with the [quick start](/getting-started/introduction) guide or browse the open source [aa-sdk github](https://github.com/alchemyplatform/aa-sdk).

## Signer API

Every smart account is controlled by an owner private key. A signer or WaaS provider securely stores the private key, authenticates access via email/passkey, and signs transactions on the smart account.

Embedded Accounts are powered by the non-custodial Alchemy Signer API which uses Turnkey to securely store key material in a [Secure Enclave](https://docs.turnkey.com/security/our-approach) so that only the user can access it.

Account Kit also makes it easy to [bring your own signer](/signers/choosing-a-signer) with over a dozen integration guides for popular signers including [Magic](/signers/guides/magic), [Privy](/signers/guides/privy), [Web3auth](/signers/guides/web3auth), and more.

## Smart Contract Accounts

The smart contract is the heart of the user's account. It secures their assets, executes every UserOp, and represents the user's public address onchain, so this is a foundational choice for your apps' security, feature set, and gas costs.

Account Kit provides two smart contract accounts out of the box, and supports any custom contract of your own.

- **Modular Account**: a secure, audited, and extensible 4337 smart account that supports multiple owners, session keys, onchain recovery, and more. ([learn more](https://www.alchemy.com/blog/hello-modular-account), [github](https://github.com/alchemyplatform/modular-account))

- **Light Account**: a simple, secure, and audited 4337 smart account that supports a single owner ([github](https://github.com/alchemyplatform/light-account))

- **Bring your own**: you can even build your own account or use another open source implementation of an ERC-4337 account. Follow this guide to [use your own account](/smart-accounts/custom/using-your-own) with Account Kit.

## Gas Manager API

The Gas Manager is a programmable API to sponsor gas for UserOps. You can create programmable gas policies to specify exactly which transactions should be sponsored, set strict spending limits per wallet or globally, and allow/blocklist particular wallet addresses. It's easy to create a gas policy in the Alchemy Dashboard or update the policy dynamically through a REST API.

Learn how to [sponsor gas](/using-smart-accounts/sponsoring-gas/gas-manager) with the Gas Manager API.

## Bundler API

The Bundler submits UserOps to the blockchain for execution. This is a mission-critical operation: if your Bundler goes offline, then transactions will fail or get stuck and users will be unable to use your app.

We built our [Bundler in Rust](https://www.alchemy.com/blog/open-sourcing-rundler/?a=embedded-accounts-get-started) to handle the highest loads at production scale. It's able to handle massive scale because we operate it alongside our fleet of nodes powering the biggest dapps in web3 from Opensea to Circle.

Check out the open source code in our affectionately named [Rundler github repo](https://github.com/alchemyplatform/rundler) and start [sending UserOps](/using-smart-accounts/send-user-operations) today.

# Start building

Next, follow the [quick start](/getting-started/introduction) guide to build invisible wallets in your app.

Embedded Accounts make web3 simple so that _anyone_ can use your app in seconds with no downloads, no gas tokens, and no seed phrases. It's time to bring the whole world onchain!
