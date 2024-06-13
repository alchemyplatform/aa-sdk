---
title: How to transfer ownership of a Light Account
description: Follow this guide to transfer ownership of a Light Account with
  Account Kit, a vertically integrated stack for building apps that support
  ERC-4337 and ERC-6900.
---

# How to transfer ownership of `LightAccount`

Not all smart account implementations support transferring the ownership (e.g. `SimpleAccount`). However, a number of the accounts in this guide and in Account Kit do, including our `LightAccount`! Let's see a few different ways we can transfer ownership of an Account (using `LightAccount` as an example).

## Usage

`LightAccount` exposes the following method which allows the existing owner to transfer ownership to a new owner address:

```solidity
function transferOwnership(address newOwner) public virtual onlyOwner
```

There a number of ways you can call this method using Account Kit.

### 1. Using `transferOwnership` client action

:::code-group

```ts [example.ts]
import { smartAccountClient as lightAccountClient } from "./smartAccountClient";

// this will return the signer of the smart account you want to transfer ownerhip to
const newOwner = LocalAccountSigner.mnemonicToAccountSigner(NEW_OWNER_MNEMONIC);
const accountAddress = lightAccountClient.getAddress();

// [!code focus:99]
const hash = lightAccountClient.transferOwnership({
  newOwner,
  waitForTxn: true,
});
// after transaction is mined on the network,
// create a new light account client for the transferred Light Account
const transferredClient = await createLightAccountClient({
  transport: custom(smartAccountClient),
  chain: smartAccountClient.chain,
  signer: newOwner,
  accountAddress, // NOTE: you MUST specify the original smart account address to connect using the new owner/signer
  version: "v2.0.0", // NOTE: if the version of the light account is not v1.1.0, it must be specified here
});
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/light-account-client.ts]
```

:::

Since `@alchemy/aa-accounts` exports a `LightAccount` ABI, the above approach makes it easy to transfer ownership. That said, you can also directly call `sendUserOperation` to execute the ownership transfer. As you will see below, however, it is a bit verbose:

### 2. Using `sendUserOperation`

:::code-group

```ts [example.ts]
import { encodeFunctionData } from "viem";
import { smartAccountClient } from "./smartAccountClient";

// this will return the address of the smart account you want to transfer ownerhip of
const accountAddress = smartAccountClient.getAddress();
const newOwner = "0x..."; // the address of the new owner

// [!code focus:99]
const result = await smartAccountClient.sendUserOperation({
  to: accountAddress,
  data: smartAccountClient.encodeTransferOwnership(newOwner),
});
// wait for txn with UO to be mined
await smartAccountClient.waitForUserOperationTransaction(result);
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/light-account-client.ts]
```

:::

See the [`LightAccount`](/packages/aa-accounts/light-account/) docs for more details about our `LightAccount implementation.
