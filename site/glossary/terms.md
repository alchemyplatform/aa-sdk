---
outline: deep
head:
  - - meta
    - property: og:title
      content: Terms
  - - meta
    - name: description
      content: Glossary of terms related to Account Kit
  - - meta
    - property: og:description
      content: Glossary of terms related to Account Kit
  - - meta
    - name: twitter:title
      content: Terms
  - - meta
    - name: twitter:description
      content: Glossary of terms related to Account Kit
---

# Terms

## Account Kit

Account Kit is a framework designed to embed smart accounts in web3 applications. It includes a set of tools such as [Signer integrations](https://accountkit.alchemy.com/signers/choosing-a-signer.html), [Gas Manager](https://docs.alchemy.com/docs/gas-manager-services) and [Bundler](https://docs.alchemy.com/docs/bundler-services) utilities that unlock features such as [gas sponsorship](https://accountkit.alchemy.com/using-smart-accounts/sponsoring-gas/gas-manager.html), [batched transactions](https://accountkit.alchemy.com/using-smart-accounts/batch-user-operations.html) and email/social login. With its user-friendly suite of SDKs, known as [aa-sdk](https://github.com/alchemyplatform/aa-sdk), Account Kit makes it easy to deploy smart accounts, manage `UserOperation`s, and handle gas sponsorship, streamlining the entire process with minimal coding effort.

## Bundler

A network participant in the [ERC-4337](#erc-4337) standard that collects and submits `UserOperations` (UOs) to the blockchain, handling the associated gas fees, in exchange for payment during UO processing either directly from the user or from a [Paymaster](https://www.alchemy.com/overviews/what-is-a-paymaster). Alchemy’s implementation of a bundler is called [Rundler](https://github.com/alchemyplatform/rundler). It is written in Rust and designed to achieve high performance and reliability.

## Entrypoint

A standardized smart contract that acts as the primary gateway for processing `UserOperations` (UOs) on the blockchain. It receives bundled UOs from Bundlers and verifies and executes these operations according to predefined rules, ensuring security and adherence to user-specified conditions.

## ERC-4337

A standard authored by the [Ethereum Foundation](https://ethereum.foundation/) for [account abstraction](https://docs.alchemy.com/docs/introduction-to-account-abstraction), establishing a uniform interface for all smart accounts. This standard also outlines the roles and functionalities of [Bundlers](https://docs.alchemy.com/docs/bundler-services), [Paymasters](https://www.alchemy.com/overviews/what-is-a-paymaster), and Entrypoint.

## ERC-6492

A standard designed for verifying signatures from smart accounts that haven't been deployed yet. It is important in terms of account abstraction, allowing decentralized applications (dApps) to authenticate user signatures even before the user's smart account is deployed. The deployment of these accounts typically occurs during the user's first transaction, making [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492) essential for early interaction verification between users and dApps.

## ERC-6900

A [standard for modular smart accounts](https://eips.ethereum.org/EIPS/eip-6900) authored by Alchemy and [Yoav](https://github.com/yoavw) (one of the authors of ERC-4337) from the Ethereum Foundation. It defines a standard interface for smart accounts to install plugins.

## Gas Manager

Alchemy’s implementation of a [Paymaster](https://www.alchemy.com/overviews/what-is-a-paymaster). The [Gas Manager API](https://docs.alchemy.com/reference/gas-manager-coverage-api-quickstart) provides developers with the ability to cover the gas fees for their users, offering a more user-friendly experience. [Sign-up](https://dashboard.alchemy.com/gas-manager) now to use it.

## Light Account

[Light Account](https://accountkit.alchemy.com/smart-accounts/light-account/.html) is a production-ready [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) [smart account](#smart-account) implementation developed by Alchemy. It builds on top of Ethereum Foundation’s [SimpleAccount](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) to add key improvements such as support for ownership transfer, ERC-1271 signature support, and gas optimizations. It is [audited by Quantstamp](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf).

## Modular Account

A type of smart account enabled by the [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) standard and characterized by its [modular structure](https://accountkit.alchemy.com/smart-accounts/modular-account/.html). This structure segments different functionalities of the account into distinct, independently upgradeable modules or plugins. Each plugin can have specific functions such as validation, execution, or hooks, enabling the smart account to extend its capabilities or modify its behavior without altering the core account logic. Modular accounts enhance flexibility, upgradeability, and interoperability of [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart accounts.

## Plugin

A module for [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) smart accounts, enabling specific functions like validation, execution, and hooks. These plugins ensure modularity, upgradeability, and adherence to standardized interfaces.

## Provider

An intermediary or connector that enables interactions between applications and a blockchain network. Providers offer the necessary infrastructure and APIs to connect, query, and interact with the blockchain, enabling transactions, smart contract executions, and data retrieval. You can use `AlchemyProvider` within [aa-sdk](https://github.com/alchemyplatform/aa-sdk) to query blockchain data and send `UserOperations`.

## Signer

A service or application that manages the private key and signs `UserOperation`s. Types of signers include:

- **Custodial**: Managed by a third party, it holds and autonomously uses the private key for transactions, necessitating complete user trust.
- **Non-custodial**: While a third party manages the private key, user involvement is required for signing transactions. Examples: Turnkey, Magic.
- **MPC (Multi-Party Computation)**: Partial or complete key shares are managed by a third party, but user participation is needed for transaction signatures. Examples: Privy, Portal, Fireblocks NCW.
- **Decentralized MPC**: Operated by a decentralized network, it manages key shares and requires node consensus for transaction signatures. Examples: Lit, Web3auth, 0xpass.

## Smart Account

A [smart account](https://accountkit.alchemy.com/smart-accounts/.html#what-s-a-smart-account) is an individual on-chain account located at a public address where an ERC-4337 smart contract account is deployed. This address is controlled by one or more owners of the smart contract account. The [aa-sdk](https://github.com/alchemyplatform/aa-sdk) supports different smart account implementations such as [Light Account](https://accountkit.alchemy.com/smart-accounts/light-account/.html), [Simple Account](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) and [Modular Account](https://accountkit.alchemy.com/smart-accounts/modular-account/.html) (coming soon). You can also [add add your own account implementation in aa-sdk](https://accountkit.alchemy.com/smart-accounts/accounts/contributing.html).

## `UserOperation`

A pseudo-transaction object introduced by the ERC-4337 standard, used to execute actions via a smart account. It encapsulates the intended actions or transactions of the user, which are executed on-chain by a [Bundler](https://docs.alchemy.com/docs/bundler-services).

## Wallet

A software application to manage one or more accounts. It supports connecting to web3 apps and signing transactions via the [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) interface.

## Wallet-as-a-Service (WaaS)

Also called a key management service (KMS). WaaS is a software as a service provider that stores private key material. A WaaS provider would be classified under one of the [signer custody types](#signer).
