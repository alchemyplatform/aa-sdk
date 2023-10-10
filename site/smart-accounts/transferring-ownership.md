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

Not all Smart Contract Account implementations support transfering the owner (e.g. `SimpleAccount`). However, a number of the accounts in this guide and in the Account Kit do, including Alchemy's Light Account! Let's see a few different ways we can transfer ownership of an Account (using Light Account as an example).

## Light Account

Light Account exposes the following method which allows the existing owner to transfer ownership to a new address:

```solidity
function transferOwnership(address newOwner) public virtual onlyOwner
```

There a number of ways you can call this method using the Account Kit.

### 1. Using `LightSmartContractAccount`

::: code-group

```ts [example.ts]
import { LightSmartContractAccount } from "@alchemy/aa-accounts";
import { provider } from "./provider";

// this will return the address of the smart contract account you want to transfer ownerhip of
const accountAddress = await provider.getAddress();
const newOwner = "0x..."; // the address of the new owner

const hash = LightSmartContractAccount.transferOwnership(provider, newOwner); // [!code focus:99]
```

<<< @/snippets/provider.ts

:::

Since `@alchemy/aa-accounts` exports a `LightAccount` ABI, the above approach makes it easy to transfer ownership. That said, you can also directly call `sendUserOperation` to execute the ownership transfer. As you'll see below, however, it is a bit verbose:

### 2. Using `sendUserOperation`

Assuming you have connected the `provider` to a `LightAccount` using `provider.connect`, you can call `sendUserOperation` on the provider and encoding the `transferOwnership` call data:

::: code-group

```ts [example.ts]
import { encodeFunctionData } from "viem";
import { provider } from "./provider";

// this will return the address of the smart contract account you want to transfer ownerhip of
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

See the [`LightSmartContractAccount`](/packages/aa-accounts/light-account/introduction) docs for more details about the Alchemy Light Account implementation.
