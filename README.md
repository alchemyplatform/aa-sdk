# Alchemy Smart Wallets SDK

Build zero-friction sign-up and transaction flows with smart accounts. Sign up with email, login with passkeys, transact with sponsored gas, and checkout in one click with transaction batching.

Built on top of [viem](https://viem.sh/) and the ERC-4337 standard, this SDK is modular at every layer and can be extended to fit your custom needs.

## Packages

| Package                                              | Description                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`@alchemy/common`](packages/common)                 | Shared foundation: Alchemy transport, auth, chain registry, errors, and logging        |
| [`@alchemy/aa-infra`](packages/aa-infra)             | Bundler infrastructure: Rundler fee estimation and RPC types                           |
| [`@alchemy/smart-accounts`](packages/smart-accounts) | Smart account implementations: LightAccount, Modular Account v1/v2, and modules        |
| [`@alchemy/wallet-apis`](packages/wallet-apis)       | High-level Wallet API client: EIP-7702 smart wallets, signing, and transaction sending |

## Getting started

Check out the [quickstart guide](https://www.alchemy.com/docs/wallets/react/quickstart) to get started.

## Contributing

If you are a member of the Alchemy team, make sure to run:

```
npx turbo login --sso-team=alchemy-dot-com
```

so that you can benefit from remote caching in your builds!

We welcome contributions. Please see our [contributing guidelines](CONTRIBUTING.md) for more information.
