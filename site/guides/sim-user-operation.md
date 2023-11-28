---
outline: deep
head:
  - - meta
    - property: og:title
      content: How to Simulate a User Operation
  - - meta
    - name: description
      content: Follow this guide to simulate a User Operation with Alchemy's Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this guide to simulate a User Operation with Alchemy's Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: How to Simulate a User Operation
  - - meta
    - name: twitter:description
      content: Follow this guide to simulate a User Operation with Alchemy's Account Kit, a vertically integrated stack for building apps that support ERC-4337.
prev:
  text: Smart Accounts
  link: /smart-accounts/overview
---

# How to Simulate a User Operation

This guide will show you how to simulate a `UserOperation` (UO) with Account Kit by adding support for UO simulation on an `AlchemyProvider` and sending a User Operation from that provider only if simulation passes. By the end of this guide, you'll have a basic understanding of how to safely send UOs with the `aa-sdk`.

There are two ways that Account Kit supports UO simulation on an `AlchemyProvider`:

1. using the [`withAlchemyUserOpSimulation`](/packages/aa-alchemy/provider/withAlchemyUserOpSimulation) middleware
2. using the [`simulateUserOperationAssetChanges`](/packages/aa-alchemy/provider/simulateUserOperationAssetChanges) method

## 1. Using [`withAlchemyUserOpSimulation`](/packages/aa-alchemy/provider/withAlchemyUserOpSimulation)

To simulate User Operations, we must connect the `provider` with the middleware to simulate `UserOperations` before sending them. This can be done in a single line code, as show below!

Then, whenever you call a method on the provider which generates the UO to send (e.g. [`sendUserOperation`](/packages/aa-core/provider/sendUserOperation), [`sendTransaction`](/packages/aa-core/provider/sendTransaction), [`sendTransactions`](/packages/aa-core/provider/sendTransactions), [`buildUserOperation`](/packages/aa-core/provider/buildUserOperation), or [`buildUserOperationFromTx`](/packages/aa-core/provider/buildUserOperationFromTx)), the provider will also simulate which assets change as a result of the UO, and if simulation fails, the provider will not send the UO unnecessarily!

::: code-group

<<< @/snippets/sim-uo-example/sim-middleware.ts
<<< @/snippets/provider.ts

:::

## 2. Using [`simulateUserOperationAssetChanges`](/packages/aa-alchemy/provider/simulateUserOperationAssetChanges)

You can also selectively simulate UOs by calling the [`simulateUserOperationAssetChanges`](/packages/aa-alchemy/provider/simulateUserOperationAssetChanges) method before sending a UO. You'd be responsible for catching any errors like how it's done below, but this is a nice alternative to always running simulation.

::: code-group

<<< @/snippets/sim-uo-example/sim-method.ts
<<< @/snippets/provider.ts

:::
