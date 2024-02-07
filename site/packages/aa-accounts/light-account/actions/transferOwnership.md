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
next:
  text: Utils
---

# transferLightAccountOwnership

`transferLightAccountOwnership` is an action exported by `@alchemy/aa-accounts` which sends a UO that transfers ownership of the account to a new owner, and returns either the UO hash or transaction hash.

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./lightAccountClient";
// [!code focus:99]
// transfer ownership
const newOwner = LocalAccountSigner.mnemonicToAccountSigner(NEW_OWNER_MNEMONIC);
const hash = smartAccountClient.transferOwnership({
  newOwner,
  waitForTxn: true,
});
```

<<< @/snippets/aa-core/lightAccountClient.ts
:::

## Returns

### `Promise<0x${string}>`

A Promise containing the hash of either the UO or transaction containing the UO which transferred ownership of the smart account's owner.

## Parameters

- `client: SmartAccountClient` -- the client to use to send the transaction
- `options: TransferLightAccountOwnershipParams` -- the options to use to transfer ownership
  - `newOwner: TOwner extends SmartAccountSigner = SmartAccountSigner` -- the new owner of the account
  - `waitForTxn?: boolean` -- optionally, wait for the transaction to be mined with the UO
  - `account?: LightAccount` -- optionally, pass the account if your client is not connected to it
