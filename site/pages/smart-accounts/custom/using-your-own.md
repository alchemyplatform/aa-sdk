---
title: Using your own Smart Account
description: Follow this guide to use any smart account implementation you want
  with Account Kit, a vertically integrated stack for building apps that support
  ERC-4337 and ERC-6900.
---

# Using your own Smart Account

You are not limited to the accounts defined in `@alchemy/aa-accounts`. The `SmartAccountClient` can be used with any smart account because it only relies on the [`SmartContractAccount`](/packages/aa-core/accounts/) interface. This means you can use your own smart account implementation with Account Kit.

```ts [my-account.ts]
// [!include ~/snippets/aa-core/custom-account.ts]
```

To use your account, you will need to pass it into a `SmartAccountClient`.

```ts
import { createAlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";

const client = createAlchemySmartAccountClient({
  // created above
  account: myAccount,
  chain: sepolia,
  transport: http("RPC_URL"),
});
```

## `LightSmartContractAccount` as an Example

We have built an extension of the eth-infinitism `SimpleAccount` called [LightAccount.sol](https://github.com/alchemyplatform/light-account/blob/main/src/LightAccount.sol). You can learn more about Light Account in the [Light Account documentation](/smart-accounts/light-account/).

We provide an implementation of `SmartContractAccount` that works with `LightAccount.sol`, which can be used as an example of how to implement your own Smart Contract Account:
:::details[LightSmartContractAccount]

```ts
// [!include ~/../packages/accounts/src/light-account/accounts/account.ts]
```

:::

## The `toSmartContractAccount` Method

For your reference, this is the definition of the `toSmartContractAccount` interface as pulled from the source code:

:::details SmartContractAccount

```ts
// [!include ~/../packages/core/src/account/smartContractAccount.ts]
```

:::
