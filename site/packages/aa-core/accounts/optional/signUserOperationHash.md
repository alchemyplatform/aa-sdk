---
outline: deep
head:
  - - meta
    - property: og:title
      content: signUserOperationHash
  - - meta
    - name: description
      content: Overview of the signUserOperationHash method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the signUserOperationHash method on BaseSmartContractAccount
next:
  text: Other Methods
---

# signUserOperationHash

If your account handles [ERC-1271 signatures](https://eips.ethereum.org/EIPS/eip-1271) of `personal_sign` differently than it does user operations, you can implement your additional way to sign the user operation.

**Note**: This method is already implemented on `BaseSmartContractAccount` defaulting to using the [`signMessage`](/packages/aa-core/accounts/required/signMessage.md) method. So any class that extends and implements `BaseSmartContractAccount` may call this method.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const signature = await provider.account.signUserOperationHash(
  `<SOME_UO_HASH>`
);
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<Hash>`

The signature of the UserOperation

## Parameters

### `uoHash: Hash`

The hash of the UserOperation to sign
