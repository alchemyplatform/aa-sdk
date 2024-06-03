---
title: How to simulate a User Operation
description: Follow this guide to simulate a User Operation with Alchemy's Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# How to simulate a User Operation

This guide will show you how to simulate a `UserOperation` (UO) with Account Kit by adding support for UO simulation on an `AlchemySmartAccountClient` and sending a User Operation from that client only if simulation passes. By the end of this guide, you will have a basic understanding of how to safely send UOs with the `aa-sdk`.

:::warning

Please note that the UO simulation results are based on the blockchain's state at the time of simulation. Changes in the blockchain state, such as updates to contract variables or balances, can occur between the time of simulation and when your UO actually gets executed.

This could lead to different outcomes than predicted. For instance, if a UO's effect is conditional on the current state of a contract, and this state is altered before the UO is executed, the final result may not match the simulation.

Please be aware of this potential variance and consider it while using UO simulations.

:::

## 1. Using [`alchemyUserOperationSimulator` middleware](/packages/aa-alchemy/middleware/alchemyUserOperationSimulator)

To simulate User Operations, we must create an Alchemy Client and pass in the `useSimulation` flag to true.

Then, whenever you call a method on the client which generates the UO to send (e.g. [`sendUserOperation`](/packages/aa-core/smart-account-client/actions/sendUserOperation), [`sendTransaction`](/packages/aa-core/smart-account-client/actions/sendTransaction), [`sendTransactions`](/packages/aa-core/smart-account-client/actions/sendTransactions), [`buildUserOperation`](/packages/aa-core/smart-account-client/actions/buildUserOperation), or [`buildUserOperationFromTx`](/packages/aa-core/smart-account-client/actions/buildUserOperationFromTx)), the client will also simulate which assets change as a result of the UO, and if simulation fails, the client will not send the UO unnecessarily!

```ts [sim-middleware.ts]
// [!include ~/snippets/sim-uo-example/sim-middleware.ts]
```

## 2. Using [`simulateUserOperation`](/packages/aa-alchemy/smart-account-client/actions/simulateUserOperation)

You can also selectively simulate UOs by calling the [`simulateUserOperation`](/packages/aa-alchemy/smart-account-client/actions/simulateUserOperation) method before sending a UO. You would be responsible for catching any errors like how it is done below, but this is a nice alternative to always running simulation.

```ts [sim-method.ts]
// [!include ~/snippets/sim-uo-example/sim-method.ts]
```
