---
title: SmartAccountClient Middleware
description: Overview of ClientMiddleware exported by aa-core
---

# ClientMiddleware

Middleware represents different operations involved in the [`SmartAccountClient`](/packages/aa-core/smart-account-client/) pipeline for constructing a user operation given the user inputs by populating the UO with other data, including gas fees, paymaster data, etc.

Each middleware is a function that takes in a user operation object, performs its job to retrieve or compute the data, and populate different fields of the user operation to pass onto the next middleware in the pipeline before being signed and sent to the network.

:::details[ClientMiddlewareFn]

```ts
// [!include ~/../packages/core/src/middleware/types.ts:ClientMiddlewareFn]
```

:::

:::details[ClientMiddleware]

```ts
// [!include ~/../packages/core/src/middleware/types.ts:ClientMiddleware]
```

:::

## Types of ClientMiddlewares

### feeEstimator

`feeEstimator` middleware is responsible for computing `maxFeePerGas` and `maxPriorityFeePerGas` fields of [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337#specification) user operation.

### gasEstimator

`gasEstimator` middleware is responsible for computing `callGasLimit`, `preVerificationGas`, and `verificationGasLimit` fields of user operation.

### paymasterAndData

`paymasterAndData` middleware is responsible for computing `paymasterAndData` fields of user operation after estimating gas and fees. `dummyPaymasterAndData` is a dummy middleware for seting the `paymaster` address and the `paymasterData` dummy data by either returning the concatenated `Hex` string, or the object containing these fields at the beginning of the middleware pipeline to be used later for gas estimation before the actual paymaster middleware run. This will depend on your paymaster provider and must be a value that accurately resembles the gas cost of using your paymaster and does not revert during validation.

### customMiddleware

This is a no-op middleware, but you can include any custom step during the user operation construction pipeline.

### userOperationSimulator

If you are simulating a user operation using [`simulateUserOperation`](/packages/aa-alchemy/smart-account-client/actions/simulateUserOperation), `SmartAccountClient` will include `userOperationSimulator` middleware during the pipeline run to simulate the user operation instead of sending it to the network to be mined.

During the `SmartAccountClient` middleware pipeline run, each middleware is applied to compute certain fields of the [`UserOperationStruct`](/resources/types#useroperationstruct) in the following sequential order:

1. `dummyPaymasterDataMiddleware` -- populates dummy paymaster data to use in estimation (default: `0x` for no paymaster)
2. `feeEstimator` -- sets `maxfeePerGas` and `maxPriorityFeePerGas`
3. `gasEstimator` -- sets `verificationGasLimit`, `callGasLimit`, `preVerificationGas`, and if EntryPoint v0.7 user operation, `paymasterVerificationGasLimit` fields. The default `gasEstimator` calls `eth_estimateUserOperationGas` on the bundler to query for these gas estimates.
4. `customMiddleware` -- default no-op middleware, available for any custom operation to be done in addition and override any of the results returned by previous middlewares
5. `paymasterMiddleware` -- used to set paymaster fields of a user operation. (default: `0x` for no paymaster)
6. `userOperationSimulator` -- used for the simulation of a user operation instead of sending it to the network to be mined. Refer to [`alchemyUserOperationSimulator`](/packages/aa-alchemy/middleware/alchemyUserOperationSimulator) to learn more about how to enable user operation simulation feature on your smart account client.
7. `signUserOperation` -- used for the signing the built, but yet to be signed, user operation after all other middlewares are run. Note that `signUserOperation` middleware run is decoupled from the other middlewares pipeline run for building the user operation. Rather, the user operation is signed right before the client sends the user operation to the network.

## Overriding default middlewares with your own

For each middleware, a default middleware is available for the `SmartAccountClient`, which computes user operation fields based on the user input of operation call data. If you are looking to customize certain behaviors of user operation struct construction for your client, you can flexibly override with your own middleware specifying in the [`ClientMiddlewareConfig`](/resources/types#clientmiddlewareconfig) during the `SmartAccountClient` instantiation. For example, the following illustrates how you can override the default gas estimation behavior by overriding the default gas estimator with your own.

```ts
export type ClientMiddlewareConfig = Omit<
  Partial<ClientMiddleware>,
  "dummyPaymasterAndData" | "paymasterAndData"
> & {
  paymasterAndData?: {
    dummyPaymasterAndData: () =>
      | UserOperationRequest<"0.6.0">["paymasterAndData"]
      | Pick<UserOperationRequest<"0.7.0">, "paymaster" | "paymasterData">;
    paymasterAndData: ClientMiddlewareFn;
  };
};

export type SmartAccountClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = Prettify<
  Pick<
    ClientConfig<transport, chain, account>,
    | "cacheTime"
    | "chain"
    | "key"
    | "name"
    | "pollingInterval"
    | "transport"
    | "type"
  > & {
    account?: account;
    opts?: z.input<typeof SmartAccountClientOptsSchema>;
  } & ClientMiddlewareConfig;
```

## Example

```ts
import { http } from "viem";
import { sepolia } from "@alchemy/aa-core";

const client = createSmartAccountClient({
  transport: http("RPC_URL"),
  chain: sepolia,
  // override the default gas estimator to use your own version
  gasEstimator: async (struct) => ({
    ...struct,
    callGasLimit: 0n,
    preVerificationGas: 0n,
    verificationGasLimit: 0n,
  }),
});
```
