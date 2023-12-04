# aa-sdk

The `aa-sdk` is a type-safe and performant suite of TypeScript SDKs built on top of [viem](https://viem.sh/) to provide ergonomic methods for sending user operations, sponsoring gas, and deploying smart accounts. It handles all the complexity of ERC-4337 under the hood to make account abstraction simple.

There are currently 5 SDKs that are part of the `aa-sdk` suite:

1. [`aa-core`](https://github.com/alchemyplatform/aa-sdk/tree/main/packages/core)
2. [`aa-alchemy`](https://github.com/alchemyplatform/aa-sdk/tree/main/packages/alchemy)
3. [`aa-accounts`](https://github.com/alchemyplatform/aa-sdk/tree/main/packages/accounts)
4. [`aa-signers`](<(https://github.com/alchemyplatform/aa-sdk/tree/main/packages/signers)>)
5. [`aa-ethers`](https://github.com/alchemyplatform/aa-sdk/tree/main/packages/ethers)

The core SDK also implements an EIP-1193 provider interface to easily plug into any popular dapp or wallet connect libraries such as RainbowKit, Wagmi, and Web3Modal. It also includes [`ethers.js`](https://docs.ethers.org/v5/) adapters to provide full support for `ethers.js`` apps.

The `aa-sdk` is modular at every layer of the stack and can be easily extended to fit your custom needs. You can plug in any [smart account](https://accountkit.alchemy.com/smart-accounts/accounts/using-your-own) implementation, [Signer](https://accountkit.alchemy.com/smart-accounts/signers/overview), [Gas Manager API](https://accountkit.alchemy.com/overview/introduction.html#gas-manager-api) and RPC Provider.

## Getting Started

The `aa-sdk` is part of [Account Kit](https://accountkit.alchemy.com). Check out this [quickstart guide](https://accountkit.alchemy.com/getting-started.html) to get started, or an [overview](https://accountkit.alchemy.com/overview/package-overview.html) of each of the SDKs in this repo.

## Contributing

We welcome contributions to `aa-sdk`. Please see our [contributing guidelines](CONTRIBUTING.md) for more information.
