---
outline: deep
head:
  - - meta
    - property: og:title
      content: LightSmartContractAccount • transferOwnership
  - - meta
    - name: description
      content: Overview of the transferOwnership method on LightSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the transferOwnership method on LightSmartContractAccount
---

# transferOwnership

`transferOwnership` is a static class method on the `LightSmartContractAccount` which sends a UO that transfers ownership of the account to a new owner, and returns either the UO hash or transaction hash.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
// transfer ownership
const newOwner = LocalAccountSigner.mnemonicToAccountSigner(NEW_OWNER_MNEMONIC);
const result = await LightSmartContractAccount.transferOwnership(
  provider,
  newOwner
  true, // wait for txn with UO to be mined
);
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<0x${string}>`

A Promise containing the hash of either the UO or transaction containing the UO which transferred ownership of the smart contract account's owner.

## Parameters

- `provider: SmartAccountProvider & { account: LightSmartContractAccount }` -- the provider to use to send the transaction
- `newOwner: Address` -- the new owner of the account
- `waitForTxn?: boolean` -- optionally, wait for the transaction to be mined with the UO
