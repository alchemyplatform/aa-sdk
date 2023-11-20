---
outline: deep
head:
  - - meta
    - property: og:title
      content: How to Fetch a Smart Account's ERC-20 Tokens
  - - meta
    - name: description
      content: Follow this guide to fetch a smart account's ERC-20 Tokens with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this guide to fetch a smart account's ERC-20 Tokens with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: How to Fetch a Smart Account's ERC-20 Tokens
  - - meta
    - name: twitter:description
      content: Follow this guide to fetch a smart account's ERC-20 Tokens with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# How to Fetch a Smart Account's ERC-20 Tokens

Alchemy provides several [Enhanced APIs](https://www.alchemy.com/enhanced-apis), which are especially useful for querying information about the smart accounts you create using Account Kit, such as the account's ERC-20 Token balances using the [Token API](https://www.alchemy.com/token-api).

For the purposes of our example, we'll use the Token API to query our smart account's data by extending the Alchemy Provider [with Enhanced APIs](/packages/aa-alchemy/provider/withAlchemyEnhancedApis.md).

## 1. Install the [`alchemy-sdk`](https://github.com/alchemyplatform/alchemy-sdk-js)

Alchemy has developed a Typescript SDK to make development with the Enhanced APIs simple. The SDK includes ways to leverage Alchemy's Simulation API, Token API, Transact API, NFT API, Webhooks and Websockets, and more across Alchemy's supported chains. Take a look at the code [here](https://github.com/alchemyplatform/alchemy-sdk-js).

We will use the Alchemy SDK Client to extend our Alchemy Provider using the provider's [`withAlchemyEnhancedApis`](/packages/aa-alchemy/provider/withAlchemyEnhancedApis.md) method. That way, our provider will have direct access to the Enhanced APIs.

To use the Alchemy SDK in our project directory, we'll need to install the required package:

::: code-group

```bash [npm]
npm i alchemy-sdk
```

```bash [yarn]
yarn add alchemy-sdk
```

:::

## 2. Extend the Alchemy Provider with Enhanced APIs

Then, all we need to do is create an `alchemy` client from the Alchemy SDK, create an `AlchemyProvider` from Account Kit, and then extend the provider with functionality from the SDK client using `withAlchemyEnhancedApis`. We can get the smart account's address from the `AlchemyProvider` in order to fetch the smart account's ERC-20 Tokens in just 1 line of code!

<<< @/snippets/enhanced-apis-example/token.ts

:::tip Note
Note that we must configure the Alchemy SDK client to have the same API Key and blockchain network as Alchemy Provider it is extending via `withAlchemyEnhancedApis`. This method explicitly checks this requirement and will throw an error at runtime if not satisfied.

Additionally, since the Alchemy SDK client does not yet support JWT authentication, an `AlchemyProvider` initialized with JWTs cannot use this method. We must be initialize the provider with an API key or RPC URL.
:::

That's it! There are so many more Enhanced APIs the the Alchemy SDK exposes, and can be useful for development with Account Abstraction. Try it out [here](https://github.com/alchemyplatform/alchemy-sdk-js), and check out [How to fetch a Smart Account's NFTs](/guides/enhanced-apis/nft) for another example.
