---
outline: deep
head:
  - - meta
    - property: og:title
      content: SmartContractAccount
  - - meta
    - name: description
      content: Overview of ClientMiddleware exported by aa-core
  - - meta
    - property: og:description
      content: Overview of ClientMiddleware exported by aa-core
---

# ClientMiddleware

Middleware represents different operations involved in the [`SmartAccountClient`](/packages/aa-core/smart-account-client/) pipeline for constructing a user operation given the user inputs by populating the UO with other data including gas fee, paymaster data, etc.

Each middleware is a function that takes in a user operation object, performs its job to retrieve or compute the data, and populate different fields of user operation to pass onto the next middleware in the pipeline before being signed and sent to the network.

```ts
export type ClientMiddlewareFn = <TAccount extends SmartContractAccount>(
  struct: Deferrable<UserOperationStruct>,
  args: {
    overrides?: UserOperationOverrides;
    feeOptions?: UserOperationFeeOptions;
    account: TAccount;
  }
) => Promise<Deferrable<UserOperationStruct>>;

export type ClientMiddleware = {
  feeEstimator: ClientMiddlewareFn;
  gasEstimator: ClientMiddlewareFn;
  customMiddleware: ClientMiddlewareFn;
  paymasterAndData: ClientMiddlewareFn;
  userOperationSimulator: ClientMiddlewareFn;
};
```

### feeEstimator

`feeEstimator` middleware is responsible for computing `maxFeePerGas` and `maxPriorityFeePerGas` fields of [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337#specification) user operation.

### gasEstimator

`gasEstimator` middleware is responsible for computing `callGasLimit`, `preVerificationGas`, and `verificationGasLimit` fields of user operation.

### paymasterAndData

`paymasterAndData` middleware is responsible for computing `paymasterAndData` fields of user operation.

### customMiddleware

By default, this is a no-op middleware, but available for you to include any custom step during the user operation construction pipeline.

### userOperationSimulator

If you are simulating a user operation using [`simulateUserOperation`](/packages/aa-alchemy/smart-account-client/actions/simulateUserOperation.md), `SmartAccountClient` will include `userOperationSimulator` middleware during the pipeline run to simulate the user operation instead of sending it to the network to be mined.

For each middleware, there exists a default that `SmartAccountClient` uses, but these defaults can be overriden flexibly with your custom middleware function upon the creation of the client. Below is an example of how you can use your own version of gas estimator if you choose to opt out of using the default gas estimator.

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
