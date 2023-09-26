---
outline: deep
head:
  - - meta
    - property: og:title
      content: Transferring Ownership
  - - meta
    - name: description
      content: Guide to transferring ownership of an account
  - - meta
    - property: og:description
      content: Guide to transferring ownership of an account
---

# Transferring Ownership

Not all accounts support transfering the owner (eg. SimpleAccount). However, a number of the accounts in this guide and in the Account Kit do! Let's see a few different ways we can transfer ownership of an Account (using Light Account as an example).

## Light Account

Light Account exposes the following method which allows the existing owner to transfer ownership to a new address:

```solidity
function transferOwnership(address newOwner) public virtual onlyOwner
```

There a number of ways you can call this method using the Account Kit.

### 1. Using `sendUserOperation`

Assuming you have connected the `provider` to a `LightAccount` using `provider.connect`, you can call `sendUserOperation` on the provider and encoding the transferOwnership call data:

::: code-group

```ts [example.ts]
import { encodeFunctionData } from "viem";
import { provider } from "./provider";

// this will return the address of the account you want to transfer ownerhip of
const accountAddress = await provider.getAddress();
const newOwner = "0x..."; // the address of the new owner

// [!code focus:99]
const { hash: userOperationHash } = provider.sendUserOperation({
  to: accountAddress,
  data: encodeFunctionData({
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "newOwner",
            type: "address",
          },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "transferOwnership",
    args: [newOwner],
  }),
});
```

<<< @/snippets/provider.ts

:::

This is pretty verbose and requires you to clog up your code with the ABI. Luckily `@alchemy/aa-accounts` exports a LightAccount class that makes this much easier.

### 2. Using `LightSmartContractAccount`

::: code-group

```ts [example.ts]
import { LightSmartContractAccount } from "@alchemy/aa-accounts";
import { provider } from "./provider";

// this will return the address of the account you want to transfer ownerhip of
const accountAddress = await provider.getAddress();
const newOwner = "0x..."; // the address of the new owner

const hash = LightSmartContractAccount.transferOwnership(provider, newOwner); // [!code focus:99]
```

<<< @/snippets/provider.ts

:::

see the [`LightSmartContractAccount`](/packages/aa-accounts/light-account/introduction) docs for more details about this class.
