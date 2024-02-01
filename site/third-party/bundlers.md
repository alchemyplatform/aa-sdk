---
outline: deep
head:
  - - meta
    - property: og:title
      content: 3rd Party Bundlers
  - - meta
    - name: description
      content: Learn how to use a different RPC provider with Account Kit
  - - meta
    - property: og:description
      content: Learn how to use a different RPC provider with Account Kit
  - - meta
    - name: twitter:title
      content: 3rd Party Bundlers
  - - meta
    - name: twitter:description
      content: Learn how to use a different RPC provider with Account Kit
---

# Using a different RPC Provider

The `SmartAccountClient` within `@alchemy/aa-core` is unopinionated about which bundler you use, so you can connect to any RPC provider really simply.

## Usage

If we look at the example for creating a `SmartAccountClient`:

<<< @/snippets/aa-core/lightAccountClient.ts

You can see that we set the `transport` to `http("https://polygon-mumbai.g.alchemy.com/v2/demo")`. You can swap out that the url in the `http` function to
any other provider's URL.

::: warning
Depending on your provider, you may have to pass in custom logic for the `gasEstimator` and `feeEstimator` properties when calling `createSmartAccountClient`. Consult
with your provider on what the correct logic is.
:::

## Splitting Bundler traffic and Node RPC traffic

It might be the case that you want to use a different RPC provider for your bundler traffic and your node traffic. This is a common use case, and you can do this by passing in a custom transport function to your `createSmartAccountClient` call. For example:

```ts
import { createSmartAccountClient } from "@alchemy/aa-core";
import { sepolia } from "viem";

const chain = sepolia;
const client = createSmartAccountClient({
  chain,
  transport: (opts) => {
    const bundlerRpc = http("BUNDLER_RPC_URL")(opts);
    const publicRpc = http("OTHER_RPC_URL")(opts);

    return custom({
      request: async (args) => {
        const bundlerMethods = new Set([
          "eth_sendUserOperation",
          "eth_estimateUserOperationGas",
          "eth_getUserOperationReceipt",
          "eth_getUserOperationByHash",
          "eth_supportedEntryPoints",
        ]);

        if (bundlerMethods.has(args.method)) {
          return bundlerRpc.request(args);
        } else {
          return publicRpc.request(args);
        }
      },
    })(opts);
  },
});
```
