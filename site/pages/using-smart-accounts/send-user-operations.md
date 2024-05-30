---
title: How to send a User Operation
description: Follow this guide to send a User Operation with Account Kit, a
  vertically integrated stack for building apps that support ERC-4337 and
  ERC-6900.
---

# How to send a User Operation

This guide will show you how to send a User Operation with Account Kit by creating an Alchemy Smart Account Client, connecting it to a Light Account (a type of smart account implementation), and sending a User Operation from that client. By the end of this guide, you will have a basic understanding of how to use the SDK.

## 1. Create your Client

Using the SDK, we will create an Alchemy Smart Account Client. As it is, the clients gives you methods to query information related to user operations and smart accounts. To create a client, you will need an Alchemy API Key or RPC URL, which you can access from the [Alchemy Dashboard](https://dashboard.alchemy.com/signup/?a=aa-docs).

See [Alchemy Smart Account Client](/packages/aa-alchemy/smart-account-client/) for more details.

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/connected-client.ts]
```

## 2. Construct the call data

The best part of Account Kit is that it abstracts the differences between User Operation calldata and standard Transaction calldata, such that you can pass in typical calldata to [sendUserOperation](/packages/aa-core/smart-account-client/actions/waitForUserOperationTransaction) as if it was a transaction sent from your smart account, and we will wrap it as necessary to generate calldata as it would be as a User Operation.

The second best part of Account Kit is that it is build atop [viem](https://viem.sh/). This means we can leverage utility methods to easily generate calldata, with type safety, using a smart contract's ABI.

:::code-group

```ts [example.ts]
import { encodeFunctionData } from "viem";
import { smartAccountClient } from "./smartAccountClient.ts";
// [!code focus:16]
// this is an example ABI for a contract with a "mint" function
const AlchemyTokenAbi = [
  {
    inputs: [{ internalType: "address", name: "recipient", type: "address" }],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const uoCallData = encodeFunctionData({
  abi: AlchemyTokenAbi,
  functionName: "mint",
  args: [smartAccountClient.getAddress()],
});

const uo = await smartAccountClient.sendUserOperation({
  uo: {
    target: "0xTARGET_ADDRESS",
    data: uoCallData,
  },
});
const txHash = await smartAccountClient.waitForUserOperationTransaction(uo);
console.log(txHash);
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/connected-client.ts]
```

:::

Some other helpful viem methods include: [encodeFunctionData](https://viem.sh/docs/contract/encodeFunctionData), [decodeFunctionData](https://viem.sh/docs/contract/decodeFunctionData), and [decodeFunctionResult](https://viem.sh/docs/contract/decodeFunctionResult).

## 3. Send the User Operation

Now, we will use the connected client to send a user operation. We will use the [sendUserOperation](/packages/aa-core/smart-account-client/actions/sendUserOperation) method on the client.

You can either send ETH to the smart account to pay for User Operation's gas, or you can connect your client to our Gas Manager using the [withAlchemyGasManager](/packages/aa-alchemy/middleware/alchemyGasManagerMiddleware) method to sponsor the UO's gas. We will use the latter approach below. You can go to the [Alchemy Dashboard](https://dashboard.alchemy.com/gas-manager/?a=ak-docs) to get a Gas Manager policy ID.

We will also want to wait for the transaction that contains the User Operation so that we know the User Operation is executed on-chain. We can use the [waitForUserOperationTransaction](/packages/aa-core/smart-account-client/actions/waitForUserOperationTransaction) method on the client, as seen below.

:::code-group

```ts [example.ts]
import { encodeFunctionData } from "viem";
import { smartAccountClient } from "./smartAccountClient.ts";

// this is an example ABI for a contract with a "mint" function
const AlchemyTokenAbi = [
  {
    inputs: [{ internalType: "address", name: "recipient", type: "address" }],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const uoCallData = encodeFunctionData({
  abi: AlchemyTokenAbi,
  functionName: "mint",
  args: [smartAccountClient.getAddress()],
});

// [!code focus:10]
const uo = await smartAccountClient.sendUserOperation({
  uo: {
    target: "0xTARGET_ADDRESS",
    data: uoCallData,
  },
});
const txHash = await smartAccountClient.waitForUserOperationTransaction(uo);
console.log(txHash);
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/connected-client.ts]
```

:::

## Try the full example!

And that's it! Let's put it all together. You can copy the following snippet to try it yourself!

```ts [full-example.ts]
// [!include ~/snippets/send-uo-example/full-example.ts]
```
