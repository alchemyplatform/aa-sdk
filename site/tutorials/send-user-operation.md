---
outline: deep
head:
  - - meta
    - property: og:title
      content: How to Send a User Operation
  - - meta
    - name: description
      content: Follow this guide to send a User Operation with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this guide to send a User Operation with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: How to Send a User Operation
  - - meta
    - name: twitter:description
      content: Follow this guide to send a User Operation with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
prev:
  text: Smart Accounts
  link: /smart-accounts/overview
---

# How to Send a User Operation

This guide will show you how to send a User Operation with Account Kit by creating an Alchemy Provider, connecting it to a Light Account (a type of smart account implementation), and sending a User Operation from that provider. By the end of this guide, you'll have a basic understanding of how to use the SDK.

## 1. Create Your Provider

Using the SDK, we'll create an Alchemy Provider. As it is, the providers gives you methods to query information related to user operations and smart accounts. To create a provider, you'll need an Alchemy API Key or RPC URL, which you can access from the [Alchemy Dashboard](https://dashboard.alchemy.com).

See [Alchemy Provider](/packages/aa-alchemy/provider/introduction.md) for more details.

<<< @/snippets/send-uo-example/create-provider.ts

## 2. Connect Your Smart Account

To send User Operations, we must connect the `provider` with a smart account. The Light Account is our gas-optimized smart account implementation, which we'll use in this example.

See [Light Account](/packages/aa-accounts/light-account/introduction.md) for more details.

<<< @/snippets/send-uo-example/connect-account.ts

## 3. Construct The CallData

The best part of Account Kit is that it abstracts the differences between User Operation calldata and standard Transaction calldata, such that you can pass in typical calldata to [sendUserOperation](/packages/aa-core/provider/waitForUserOperationTransaction.md) as if it was a transaction sent from your smart account, and we'll wrap it as necessary to generate calldata as it would be as a User Operation.

The second best part of Account Kit is it's build atop [viem](https://viem.sh/). This means we can leverage utility methods to easily generate calldata, with type safety, using a smart contract's ABI.

<<< @/snippets/send-uo-example/calldata.ts

Some other helpful viem methods include: [encodeFunctionData](https://viem.sh/docs/contract/encodeFunctionData.html), [decodeFunctionData](https://viem.sh/docs/contract/decodeFunctionData.html), and [decodeFunctionResult](https://viem.sh/docs/contract/decodeFunctionResult.html).

## 4. Send The User Operation

Now we'll use the connected provider to send a user operation. We'll use the [sendUserOperation](/packages/aa-core/provider/sendUserOperation.md) method on the provider.

You can either send ETH to the smart account to pay for User Operation's gas, or you can connect your provider to our Gas Manager using the [withAlchemyGasManager](/packages/aa-alchemy/provider/withAlchemyGasManager.md) method to sponsor the UO's gas. We'll use the latter approach below. You can go to the [Alchemy Dashboard](https://dashboard.alchemy.com/gas-manager) to get a Gas Manager policy ID.

We'll also want to wait for the transaction which contains the User Operation, so that we know the User Operation executed on-chain. We can use the [waitForUserOperationTransaction](/packages/aa-core/provider/waitForUserOperationTransaction.md) method on provider to do so, as seen below.

<<< @/snippets/send-uo-example/send-uo.ts

## Try the Full Example!

And that's it! Let's put it all together. You can copy the following snippet to try it yourself!

<<< @/snippets/send-uo-example/full-example.ts
