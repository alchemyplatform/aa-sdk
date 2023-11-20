---
outline: deep
head:
  - - meta
    - property: og:title
      content: Why Account Kit
  - - meta
    - name: description
      content: Learn the motivations behind Account Kit, and discover how it can help you provide seamless UX to your users with smart accounts.
  - - meta
    - property: og:description
      content: Learn the motivations behind Account Kit, and discover how it can help you provide seamless UX to your users with smart accounts.
  - - meta
    - name: twitter:title
      content: Why Account Kit
  - - meta
    - name: twitter:description
      content: Learn the motivations behind Account Kit, and discover how it can help you provide seamless UX to your users with smart accounts.
---

# Why Account Kit

## The Problem

It’s way too hard for new users to start using web3 apps. Today, users have to jump through hoops before they submit their first transaction:

1. Download a wallet app or extension
2. Back up the seed phrase on paper
3. Buy ETH for gas on an exchange
4. Sign a transaction in a wallet

The user leaves your app at every step! This style of web3 onboarding is too complex and intimidating — most new users drop off before they ever reach the magic moment with your app. We need to make wallets, seed phrases, and gas costs disappear in order to onboard the next billion users.

## The Solution: Smart Accounts

Account Kit provides all the tools you need to onboard the next 1B users with a simple, familiar user experience.

<VideoEmbed src="/videos/accountkit-screenflow.mp4" />

With Account Kit, you can create a **smart account** for every user. Smart accounts are smart contract wallets that leverage account abstraction to radically simplify every step of the onboarding experience. Now, a new user will:

1. Create a smart account directly in your app without third-party downloads
2. Sign up with an email, social login, passkey, or self-custodial wallet
3. Submit transactions without needing ETH in their account for gas
4. Submit transactions in the background without leaving your app

Account Kit makes it possible to build a web3 app that feels like web2: simple and familiar for mainstream users.

It’s enabled by [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337), a new account abstraction standard developed by Vitalik and the Ethereum Foundation. This is the beginning of a major [transition](https://vitalik.ca/general/2023/06/09/three_transitions.html) from traditional EOA wallets to smart accounts.

Account Kit was designed to make it easy for you to leverage account abstraction. It includes everything you need to ship smart accounts in minutes!

## Your app, your UX

With Account Kit, you can design every step of the user experience from signup to checkout natively in your app. Replace third-party wallet interactions with native confirmations and background transactions. Curate the right information to display and abstract away the details. Use Account Kit to streamline the experience and improve engagement with your app.

## Familiar, secure login

Streamline your sign up flow with simple web2 login options supported by Account Kit:

- Email + password
- Email + passwordless link
- Social logins like Google, Facebook, or Twitter
- Passkeys secured by fingerprints or FaceID
- Self-custodial wallets like MetaMask or Ledger
- and more

Account Kit integrates all the leading wallet Signers with bespoke integration guides for [Magic](/smart-accounts/signers/magic), [web3auth](/smart-accounts/signers/web3auth), [Turnkey](/smart-accounts/signers/turnkey), [Privy](/smart-accounts/signers/privy), [Dynamic](/smart-accounts/signers/dynamic), [Fireblocks](/smart-accounts/signers/fireblocks), [Portal](/smart-accounts/signers/portal), [Capsule](/smart-accounts/signers/capsule) and [Lit Protocol](/smart-accounts/signers/lit). Account Kit even supports self-custodial wallets like MetaMask or Ledger. Users can even change their Signer later via Account Kit’s [ownership transfer](/guides/transferring-ownership) functionality.

Learn [how to choose the right Signer for your use case in this doc](/smart-accounts/signers/choosing-a-signer).

## Sponsor gas

Account Kit removes the greatest barrier to entry of all: gas fees.

Many newcomers give up on web3 before submitting their first transaction. It's daunting to buy crypto for the first time, especially before trying the app! Gas fees -- even cheap ones on L2 -- discourage newcomers from trying your app.

With Account Kit you can remove this barrier by [sponsoring gas fees](/guides/sponsoring-gas/sponsoring-gas) for transactions — especially the first one! Get the user to your app’s magic moment as quickly, and help them fall in love with your product before asking them to deposit money.

The [Gas Manager API](https://dashboard.alchemy.com/gas-manager) included in Account Kit is a powerful tool to [sponsor gas](/guides/sponsoring-gas/sponsoring-gas). Sponsorship rules are programmable, giving you precise control over spending limits, allowlisted/blocklisted wallet addresses, and more through a REST API or an intuitive management dashboard.

In the future, Account Kit will support paying gas in stablecoins like USDC and other ERC20s. If you’re interested those features, [contact us](mailto:account-abstraction@alchemy.com) to chat.

## Batch transactions

Streamline multi-step actions into a single click. Using the Bundler API, you can effortlessly [batch multiple transactions](/guides/batching-transactions) into a single operation. For example, imagine a normal user who wants to mint two NFTs as part of your giveaway. You can submit a single user operation that batches the following transactions together all with a single click and sponsored gas:

1. Deploy a smart account contract for the user
2. Mint NFT #1
3. Mint NFT #2

Here’s another great example: on DEXes you can batch the `Approve` transaction and `Swap` transaction into a single operation. The user never needs to know about token approvals!

## Instant compatibility

Account Kit is instantly [compatible with your dapp](https://docs.alchemy.com/docs/how-to-make-your-dapp-compatible-with-smart-contract-wallets) because it supports the EIP-1193 standard. Almost all dapps use this canonical interface to communicate with wallets and send requests. This means that Account Kit will plug into all the wallet connect libraries you know and love including RainbowKit, Wagmi, and Web3Modal to name a few. Account Kit is also built on viem with support for ethers.js, enabling engineers to get started in minutes!

## The complete stack for account abstraction

We built Account Kit from the ground up to be reliable, scalable, and developer-friendly. When you use Account Kit, you’re tapping into a vertically integrated stack designed to work together seamlessly from bottom to top:

- **aa-sdk**: A lightweight library to integrate, deploy, and use smart accounts. The `aa-sdk` orchestrates operations like gas estimation, UserOp submission, and counterfactual address generation under the hood. We handled all the details so you don’t have to.
- **Light Account:** Secure, gas-optimized, audited smart accounts. Purpose-built for [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) and forward compatible with [EIP-6900](https://eips.ethereum.org/EIPS/eip-6900).
- **Signer:** Bespoke developer guides to integrate the most popular wallet providers. Secure your accounts with email, social login, passkeys, or a self-custodial wallet Signer.
- **Gas Manager API:** A programmable API to abstract away gas fees for UserOps that meet your criteria. We built [programmable policies](https://docs.alchemy.com/reference/gas-manager-admin-api-quickstart) to give you flexibility and control to decide which transactions should be sponsored. The Gas Manager works hand-in-hand with the Bundler.
- **Bundler API:** The most reliable ERC-4337 Bundler. Land your UserOps onchain at massive scale. We wrote our Bundler from scratch, in Rust, to handle the highest loads at production scale. Check out the open source code in our affectionately named [Rundler github repo](https://github.com/alchemyplatform/rundler).

We have years of experience as the leading web3 developer platform powering customers from Opensea to Shopify, and brought all that expertise to bear in Account Kit.

Get started with Account Kit on the next page: [Getting Started](/overview/getting-started).
