---
title: Gas benchmarks
description: Gas benchmarks for Alchemy Accounts
---

# Gas benchmarks

[Light Account](/smart-accounts/light-account/) currently provides best-in-class end-user costs on all of its supported chains, including Ethereum, Arbitrum, Optimism, Base, and Polygon. For those looking for a lightweight, production-ready account that supports ownership transfers, multiple owners, and ERC-1271 signature support, Light Account is a great choice.

[Modular Account](/smart-accounts/modular-account/) is an enterprise-grade smart contract account designed for security and modularity, allowing for customization via ERC-6900 plugins. It is highly optimized for calldata costs, which has historically made up the majority of the fees on Ethereum rollups. As a durable user account, Modular Accounts contain guardrails for permissionless interoperable usage, extending beyond the per-app embedded account paradigm that is popular today to help drive forward an invisible and interoperable future. The account is heavily optimized for day-to-day usage, with certain security features adding some execution overhead at deployment time.

:::info
With [EIP-4844](https://eips.ethereum.org/EIPS/eip-4844), calldata costs have gone down significantly. Future versions of Modular Account will be optimized for this environment.
:::

To measure cost, we built a comprehensive testing suite for smart contract accounts for accurate, transaction-based fee measurements and calculations. You can find the repository, full methodology, and detailed results on GitHub at [alchemyplatform/aa-benchmarks](https://github.com/alchemyplatform/aa-benchmarks).
