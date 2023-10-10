# Account Abstraction SDK (aa-sdk)

The `aa-sdk` is a type-safe and performant TypeScript library built on top of [viem](https://viem.sh/) to provide ergonomic methods for sending user operations, sponsoring gas, and deploying smart contract accounts. It handles all the complexity of ERC-4337 under the hood to make account abstraction simple.

The SDK also implements an EIP-1193 provider interface to easily plug into any popular dapp or wallet connect libraries such as RainbowKit, Wagmi, and Web3Modal. It also includes ethers.js adapters to provide full support for ethers.js apps.

The `aa-sdk` is modular at every layer of the stack and can be easily extended to fit your custom needs. You can plug in any [smart account](https://accountkit.alchemy.com/smart-accounts/accounts/using-your-own) implementation, [Signer](https://accountkit.alchemy.com/smart-accounts/signers/overview), gas manager API, RPC provider.

## Getting Started

### Install the Packages

```bash [yarn]
yarn add @alchemy/aa-accounts @alchemy/aa-core
```

### [Light Account Example](https://accountkit.alchemy.com/getting-started#a-simple-light-account-example)

## Docs

The `aa-sdk` is part of Alchemy's Account Kit. For more information, check out the [Account Kit docs](https://accountkit.alchemy.com).

## Contributing

1. clone the repo
2. run `yarn`
3. Make changes to packages

To run tests:
run `yarn test`
