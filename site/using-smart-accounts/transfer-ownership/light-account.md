---
outline: deep
head:
  - - meta
    - property: og:title
      content: How to transfer ownership of a Light Account
  - - meta
    - name: description
      content: Follow this guide to transfer ownership of a Light Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Follow this guide to transfer ownership of a Light Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: How to transfer ownership of a Light Account
  - - meta
    - name: twitter:description
      content: Follow this guide to transfer ownership of a Light Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# How to transfer ownership of a Light Account

Not all smart account implementations support transfering the ownership(e.g. `SimpleAccount`). However, a number of the accounts in this guide and in Account Kit do, including our Light Account! Let's see a few different ways we can transfer ownership of an Account (using Light Account as an example).

## Usage

Light Account exposes the following method which allows the existing owner to transfer ownership to a new owner address:

```solidity
function transferOwnership(address newOwner) public virtual onlyOwner
```

There a number of ways you can call this method using Account Kit.

### 1. Using `transferOwnership` client action

::: code-group

```ts [example.ts]
import { smartAccountClient as lightAccountClient } from "./smartAccountClient";

// this will return the signer of the smart account you want to transfer ownerhip to
const newOwner = LocalAccountSigner.mnemonicToAccountSigner(NEW_OWNER_MNEMONIC);

// [!code focus:99]
const hash = lightAccountClient.transferOwnership({
  newOwner,
  waitForTxn: true,
});
```

<<< @/snippets/aa-alchemy/light-account-client.ts [smartAccountClient.ts]

:::

Since `@alchemy/aa-accounts` exports a `LightAccount` ABI, the above approach makes it easy to transfer ownership. That said, you can also directly call `sendUserOperation` to execute the ownership transfer. As you'll see below, however, it is a bit verbose:

### 2. Using `sendUserOperation`

::: code-group

```ts [example.ts]
import { encodeFunctionData } from "viem";
import { smartAccountClient } from "./smartAccountClient";

// this will return the address of the smart account you want to transfer ownerhip of
const accountAddress = await smartAccountClient.getAddress();
const newOwner = "0x..."; // the address of the new owner

// [!code focus:99]
const { hash: userOperationHash } = smartAccountClient.sendUserOperation({
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

<<< @/snippets/aa-alchemy/light-account-client.ts [smartAccountClient.ts]

:::

See the [`LightAccount`](/packages/aa-accounts/light-account/) docs for more details about our Light Account implementation.
