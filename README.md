# Account Kit

Build zero friction sign up and transaction flows with smart accounts. Sign up with email, login with passkeys, transact with sponsored gas, and checkout in one click with transaction batching.

This repo contains all of the packages that make up Account Kit as well as the core AA SDK that Account Kit is built on top of. These packages allow you to build your app on top of Account Abstraction, offering you everything from a fully integrated solution through React Components down to the low level clients and interfaces you need to have full control over development!

## @account-kit/\*

Account Kit packages are all prefixed with `@account-kit` are are broken down into the following packages:

1. [`@account-kit/react`](https://github.com/alchemyplatform/aa-sdk/tree/main/account-kit/react)
1. [`@account-kit/core`](https://github.com/alchemyplatform/aa-sdk/tree/main/account-kit/core)
1. [`@account-kit/infra`](https://github.com/alchemyplatform/aa-sdk/tree/main/account-kit/infra)
1. [`@account-kit/signer`](https://github.com/alchemyplatform/aa-sdk/tree/main/account-kit/signer)
1. [`@account-kit/smart-contracts`](https://github.com/alchemyplatform/aa-sdk/tree/main/account-kit/smart-contracts)

## @aa-sdk/\*

The `aa-sdk` is a type-safe and performant suite of TypeScript SDKs built on top of [viem](https://viem.sh/) to provide ergonomic methods for sending user operations, sponsoring gas, and deploying smart accounts. It handles all the complexity of ERC-4337 under the hood to make account abstraction simple.

There are currently 2 SDKs that are part of the `aa-sdk` suite:

1. [`@aa-sdk/core`](https://github.com/alchemyplatform/aa-sdk/tree/main/aa-sdk/core)
1. [`@aa-sdk/ethers`](https://github.com/alchemyplatform/aa-sdk/tree/main/aa-sdk/ethers)

The core SDK also implements an EIP-1193 provider interface to easily plug into any popular dapp or wallet connect libraries such as RainbowKit, Wagmi, and Web3Modal. It also includes [`ethers.js`](https://docs.ethers.org/v5/) adapters to provide full support for `ethers.js`` apps.

The `aa-sdk` is modular at every layer of the stack and can be easily extended to fit your custom needs. You can plug in any [smart account](https://accountkit.alchemy.com/smart-accounts/custom/using-your-own) implementation, [Signer](https://accountkit.alchemy.com/what-is-a-signer), [Gas Manager API](https://accountkit.alchemy.com/react/sponsor-gas) and RPC Provider.

## Getting started

Check out this [quickstart guide](https://accountkit.alchemy.com/react/quickstart) to get started.

## Contributing

If you are a member of the Alchemy team, make sure to run:

```
npx turbo login --sso-team=alchemy-dot-com
```

so that you can benefit from remote caching in your builds!

We welcome contributions to `aa-sdk`. Please see our [contributing guidelines](CONTRIBUTING.md) for more information.
