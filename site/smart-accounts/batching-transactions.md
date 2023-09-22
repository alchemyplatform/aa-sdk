---
outline: deep
head:
  - - meta
    - property: og:title
      content: Batching Transactions
  - - meta
    - name: description
      content: Guide to submitting Transactions in batches with Account Kit
  - - meta
    - property: og:description
      content: Guide to submitting Transactions in batches with Account Kit
---

# Batching Transactions

One benefit of Smart Contract Accounts is that it's possible to batch transactions in one User Operation. Not all Smart Contract Accounts support batching, but, if the account you're using does, then implementations of `SmartAccountProvider` will allow you to make those calls.

There are two ways you can batch transacations:

1. via `sendUserOperation`
2. via `sendTransactions`

## `sendUserOperation`

The `SmartAccountProvider` supports passing either a single `UserOperation` or an array of `UserOperation`s to `sendUserOperation`. If you pass an array, the provider will batch the transactions into a single User Operation and submit it to the network. Let's see an example:

::: code-group

```ts [example.ts]
import { provider } from "./provider";

// [!code focus:99]
// the hash returned here is the hash of the User Operation
const { hash } = await provider.sendUserOperation([
  {
    target: "0x...",
    data: "0xcallDataTransacation1",
  },
  {
    target: "0x...",
    data: "0xcallDataTransacation2",
  },
]);
```

```ts [provider.ts]
import { LocalAccountSigner } from "@alchemy/aa-core";

const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);

export const provider = new SmartAccountProvider(
  "https://polygon-mumbai.g.alchemy.com/v2/demo", // rpcUrl
  "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // entryPointAddress
  polygonMumbai // chain
).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      chain: polygonMumbai,
      factoryAddress: "0xfactoryAddress",
      rpcClient,
      owner,
    })
);
```

:::

## `sendTransactions`

The `SmartAccountProvider` supports sending UserOperations and waiting for them to be mined in a transaction via the `sendTransaction` and `sendTransactions` methods. The latter allows for batching in the same way `sendUserOperation`:

::: code-group

```ts [example.ts]
import { provider } from "./provider";

// [!code focus:99]
// the hash returned here is the hash of the mined Tx that includes the UserOperation
const hash = await provider.sendTransactions([
  {
    to: "0x...",
    data: "0xcallDataTransacation1",
  },
  {
    to: "0x...",
    data: "0xcallDataTransacation2",
  },
]);
```

```ts [provider.ts]
import { LocalAccountSigner } from "@alchemy/aa-core";

const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);

export const provider = new SmartAccountProvider(
  "https://polygon-mumbai.g.alchemy.com/v2/demo", // rpcUrl
  "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // entryPointAddress
  polygonMumbai // chain
).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      chain: polygonMumbai,
      factoryAddress: "0xfactoryAddress",
      rpcClient,
      owner,
    })
);
```

:::
