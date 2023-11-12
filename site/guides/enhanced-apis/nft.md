---
outline: deep
head:
  - - meta
    - property: og:title
      content: How to Fetch a Smart Account's NFTs
  - - meta
    - name: description
      content: Follow this guide to fetch a Smart Account's NFTs with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this guide to fetch a Smart Account's NFTs with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: How to Get a Smart Account's NFTs
  - - meta
    - name: twitter:description
      content: Follow this guide to fetch a Smart Account's NFTs with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# How to Fetch a Smart Account's NFTs

Alchemy provides several [Enhanced APIs](https://www.alchemy.com/enhanced-apis), which are especially useful for querying information about the smart accounts you create using Account Kit, such as the account's owned NFTs using the [NFT API](https://www.alchemy.com/nft-api).

There are three ways you can use Alchemy's NFT API using Account Kit:

1. via extending the Alchemy Provider [with Enhanced APIs](/packages/aa-alchemy/provider/withAlchemyEnhancedApis.md)
2. via the [Alchemy SDK](https://www.alchemy.com/sdk) directly
3. via a custom [Viem Client](https://viem.sh/docs/clients/custom.html)

## 1. Extending the Alchemy Provider with Enhanced APIs

Alchemy has developed a Typescript SDK to make development with the Enhanced APIs simple. The SDK includes ways to leverage Alchemy's Simulation API, Token API, Transact API, NFT API, Webhooks and Websockets, and more across Alchemy's supported chains. Take a look at the code [here](https://github.com/alchemyplatform/alchemy-sdk-js).

We will use the Alchemy SDK Client to extend our Alchemy Provider using the provider's [`withAlchemyEnhancedApis`](/packages/aa-alchemy/provider/withAlchemyEnhancedApis.md) method. That way, our provider will have direct access to the Enhanced APIs. For the purposes of our example, we'll use the NFT API.

To use the Alchemy SDK in our project directory, we'll need to install the required package:

::: code-group

```bash [npm]
npm i alchemy-sdk
```

```bash [yarn]
yarn add alchemy-sdk
```

:::

Then, all we need to do is create an `alchemy` client from the Alchemy SDK, create an `AlchemyProvider` from Account Kit, and then extend the provider with functionality from the SDK client using `withAlchemyEnhancedApis`. We can get the smart account's address from the `AlchemyProvider` in order to fetch the smart account's NFT in just 1 line of code!

<<< @/snippets/enhanced-apis-example/alchemy-sdk-extend/example-nft.ts

:::tip Note
Note that we must configure the Alchemy SDK client to have the same API Key and blockchain network as Alchemy Provider it is extending via `withAlchemyEnhancedApis`. This method explicitly checks this requirement and will throw an error at runtime if not satisfied.

Additionally, since the Alchemy SDK client does not yet support JWT authentication, an `AlchemyProvider` initialized with JWTs cannot use this method. We must be initialize the provider with an API key or RPC URL.
:::

## 2. Alchemy SDK

We can also use the Alchemy SDK client directly to query blockchain data for our `AlchemyProvider`.

Since we still need to use the Alchemy SDK in our project directory, we'll need to install the required package:

::: code-group

```bash [npm]
npm i alchemy-sdk
```

```bash [yarn]
yarn add alchemy-sdk
```

:::

Then, it's simply a matter of creating an `AlchemyProvider` from Account Kit and then creating an `alchemy` client from the Alchemy SDK. We can get the smart account's address from the `AlchemyProvider` in order to fetch the smart account's NFT in just 1 line of code!

<<< @/snippets/enhanced-apis-example/alchemy-sdk/example-nft.ts

:::tip Note
This approach does not explicitly check that the Alchemy SDK client to have the same API Key and blockchain network as Alchemy Provider it is extending via `withAlchemyEnhancedApis`. Therefore, we highly recommend approach 1.
:::

There are so many more Enhanced APIs the the Alchemy SDK exposes, and can be useful for development with Account Abstraction. Try it out [here](https://github.com/alchemyplatform/alchemy-sdk-js)!

## 3. Custom Viem Client

Since Account Kit is built atop [viem](https://viem.sh/), we can leverage utility methods to easily generate a JSON-RPC client, extend it with custom functionality to call Alchemy Enhanced APIs, and expose type-safe decorators to rapidly improve development.

To see how we can create a custom viem client to access Alchemy Enhanced APIs, let's break down each of the following files:

1. `factory.ts`: this creates the viem client which has the ability to make calls to the Alchemy Enhanced APIs. It leverages a custom transport defined in `transport.ts` and custom actions defined in `actions.ts`.
2. `transport.ts`: this contains a custom transport that the viem client can use to handle both REST-ful and JSON-RPC requests. This is important because while most Alchemy Enhanced APIs are in JSON-RPC format, the NFT API is REST-ful. Luckily, viem provides the right abstractions.
3. `actions.ts`: this contains the custom type-decorators that the viem client can use to make calls to the Alchemy Enhanced APIs as if they were first-class methods on the client itself. For instance, calling the NFT API is as easy as calling `client.getOwnedNFTs(...)`.
4. `types-client.ts`: this contains types necessary to construct a viem JSON-RPC client with the ability to make requests to Alchemy Enhanced APIs. You can read more about extending this functionality on the [viem docs](https://viem.sh/docs/clients/custom.html).
5. `types-api.ts`: this contains the response type for the NFT API. It is outlined in the [Alchemy SDK](https://github.com/alchemyplatform/alchemy-sdk-js).
6. `types-helpers.ts`: this contains various types necessary to make calls to the Enhanced APIs. These are outlined in the [Alchemy SDK](https://github.com/alchemyplatform/alchemy-sdk-js).
7. `types-enums.ts`: this contains various enums necessary to make calls to the Enhanced APIs. These are outlined in the [Alchemy SDK](https://github.com/alchemyplatform/alchemy-sdk-js).

::: code-group

<<< @/snippets/enhanced-apis-example/viem-client/nft/factory.ts
<<< @/snippets/enhanced-apis-example/viem-client/nft/transport.ts
<<< @/snippets/enhanced-apis-example/viem-client/nft/actions.ts
<<< @/snippets/enhanced-apis-example/viem-client/nft/types-client.ts
<<< @/snippets/enhanced-apis-example/viem-client/nft/types-api.ts
<<< @/snippets/enhanced-apis-example/viem-client/nft/types-helpers.ts
<<< @/snippets/enhanced-apis-example/viem-client/nft/types-enums.ts

:::

Once you've configured the above, you can copy the following snippet to try it yourself! Notice again how we're able to query the smart account's owned NFTs in just 1 line of code!

<<< @/snippets/enhanced-apis-example/viem-client/nft/example.ts

That's it! You can even extend the client above to use even more of Alchemy's [Enhanced APIs](https://www.alchemy.com/enhanced-apis) if you so choose. Check out [How to fetch a Smart Account's ERC-20 Tokens](/guides/enhanced-apis/token) for an example.
