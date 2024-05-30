---
title: 3rd Party Bundlers
description: Learn how to use a different RPC provider with Account Kit
---

# Using a different RPC Provider

The `SmartAccountClient` within `@alchemy/aa-core` is unopinionated about which bundler you use, so you can connect to any RPC provider really simply.

## Usage

If we look at the example for creating a `SmartAccountClient`:

```ts
// [!include ~/snippets/aa-core/lightAccountClient.ts]
```

You can see that we set the `transport` to `http("https://polygon-mumbai.g.alchemy.com/v2/demo")`. You can swap out that the url in the `http` function to
any other provider's URL.

:::warning
Depending on your provider, you may have to pass in custom logic for the `gasEstimator` and `feeEstimator` properties when calling `createSmartAccountClient`. Consult
with your provider on what the correct logic is.
:::

## Splitting Bundler traffic and Node RPC traffic

It might be the case that you want to use a different RPC provider for your bundler traffic and your node traffic. This is a common use case, and you can do this by leveraging the [`split`](/packages/aa-core/split-transport) transport and passing it to your `createSmartAccountClient` call. For example:

```ts
// [!include ~/snippets/aa-core/splitTransport.ts]
```

## Zora and Fraxtal

Using a split Bundler and Node RPC setup is required for Fraxtal, Fraxtal Testnet, Zora, and Zora Sepolia networks since Alchemy currently only supports Account Abstraction endpoints for those networks. Please refer to documentation from [Frax](https://docs.frax.com/fraxtal/network/network-information) and [Zora](https://docs.zora.co/docs/zora-network/network) about RPC options.
