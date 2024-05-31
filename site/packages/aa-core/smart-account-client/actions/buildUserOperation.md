---
outline: deep
head:
  - - meta
    - property: og:title
      content: buildUserOperation
  - - meta
    - name: description
      content: Overview of the buildUserOperation method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the buildUserOperation method on SmartAccountClient
---

# buildUserOperation

Builds an _unsigned_ `UserOperation` (UO) struct with all middleware of the `SmartAccountClient` run through the middleware pipeline.

Learn more about [`ClientMiddleware`](/packages/aa-core/smart-account-client/middleware/index) to learn more about the internals of `SmartAccountClient` middleware pipeline that builds the user operation request given the user transaction call data and the operating account data.

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// build single
const uoStruct = await smartAccountClient.buildUserOperation({
  uo: {
    target: TO_ADDRESS,
    data: ENCODED_DATA,
    value: VALUE, // optional
  },
});

// signUserOperation signs the above unsigned user operation struct built
// using the account connected to the smart account client
const request = await smartAccountClient.signUserOperation({ uoStruct });

// You can use the BundlerAction `sendRawUserOperation` (packages/core/src/actions/bundler/sendRawUserOperation.ts)
// to send the signed user operation request to the bundler, requesting the bundler to send the signed uo to the
// EntryPoint contract pointed at the entryPoint address parameter
const entryPointAddress = client.account.getEntryPoint().address;
const uoHash = await smartAccountClient.sendRawUserOperation({
  request,
  entryPoint: entryPointAddress,
});

// build batch

// NOTE: Not all Smart Contract Accounts support batching.
// The `SmartContractAccount` implementation must have the `encodeBatchExecute` method
// implemented for the `SmartAccountClient` to execute the batched user operation successfully.
const batchedUoStruct = await smartAccountClient.buildUserOperation({
  uo: [
    {
      data: "0xCalldata",
      target: "0xTarget",
    },
    {
      data: "0xCalldata2",
      target: "0xTarget2",
      value: 1000n, // in wei
    },
  ],
});

// signUserOperation signs the above unsigned user operation struct built
// using the account connected to the smart account client
const request = await smartAccountClient.signUserOperation({ uoStruct });

// You can use the BundlerAction `sendRawUserOperation` (packages/core/src/actions/bundler/sendRawUserOperation.ts)
// to send the signed user operation request to the bundler, requesting the bundler to send the signed uo to the
// EntryPoint contract pointed at the entryPoint address parameter
const entryPointAddress = client.account.getEntryPoint().address;
const uoHash = await smartAccountClient.sendRawUserOperation({
  request,
  entryPoint: entryPointAddress,
});
```

<<< @/snippets/aa-core/smartAccountClient.ts
:::

## Returns

### `Promise<UserOperationStruct>`

A `Promise` containing the _unsigned_ UO struct resulting from the middleware pipeline

<!--@include: ../../../../snippets/aa-core/send-uo-param.md-->
