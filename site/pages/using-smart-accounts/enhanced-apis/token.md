---
title: How to fetch a Smart Account's ERC-20 tokens
description: Follow this guide to fetch a smart account's ERC-20 tokens with
  Account Kit, a vertically integrated stack for building apps that support
  ERC-4337 and ERC-6900.
---

# How to fetch a Smart Account's ERC-20 tokens

Alchemy provides several [Enhanced APIs](https://www.alchemy.com/enhanced-apis/?a=ak-docs), which are especially useful for querying information about the smart accounts you create using Account Kit, such as the account's ERC-20 Token balances using the [Token API](https://www.alchemy.com/token-api/?a=ak-docs).

For the purposes of our example, we will use the Token API to query our smart account's data by extending the Alchemy Smart Account Client [with Enhanced APIs](/packages/aa-alchemy/smart-account-client/actions/alchemyEnhancedApiActions).

## 1. Install the [`alchemy-sdk`](https://github.com/alchemyplatform/alchemy-sdk-js)

Alchemy has developed a Typescript SDK to make development with the Enhanced APIs simple. The SDK includes ways to leverage Alchemy's Simulation API, Token API, Transact API, NFT API, Webhooks and Websockets, and more across Alchemy's supported chains. Take a look at the code [here](https://github.com/alchemyplatform/alchemy-sdk-js).

We will use the Alchemy SDK Client to extend our Alchemy Smart Account Client using the client's [`alchemyEnhancedApiActions`](/packages/aa-alchemy/smart-account-client/actions/alchemyEnhancedApiActions) method. That way, our client will have direct access to the Enhanced APIs.

To use the Alchemy SDK in our project directory, we will need to install the required package:

:::code-group

```bash [npm]
npm i alchemy-sdk
```

```bash [yarn]
yarn add alchemy-sdk
```

:::

## 2. Extend the Alchemy Smart Account Client with Enhanced APIs

Then, all we need to do is create an `alchemy` client from the Alchemy SDK, create an `AlchemySmartAccountClient` from Account Kit, and then extend the client with functionality from the SDK client using `withAlchemyEnhancedApis`. We can get the smart account's address from the `AlchemySmartAccountClient` in order to fetch the smart account's ERC-20 Tokens in just 1 line of code!

```ts [token.ts]
// [!include ~/snippets/enhanced-apis-example/token.ts]
```

:::tip[Note]
Note that we must configure the Alchemy SDK client to have the same API Key and blockchain network as Alchemy Smart Account Client it is extending via `alchemyEnhancedApiActions`. This method explicitly checks this requirement and will throw an error at runtime if not satisfied.

Additionally, since the Alchemy SDK client does not yet support JWT authentication, an `AlchemySmartAccountClient` initialized with JWTs cannot use this method. We must be initialize the client with an API key or RPC URL.
:::

That's it! There are so many more Enhanced APIs the Alchemy SDK exposes, and can be useful for development with Account Abstraction. Try it out [here](https://github.com/alchemyplatform/alchemy-sdk-js), and check out [How to fetch a Smart Account's NFTs](/using-smart-accounts/enhanced-apis/nft) for another example.
