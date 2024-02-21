---
outline: deep
head:
  - - meta
    - property: og:title
      content: LightAccountClient • LightAccountClientActions
  - - meta
    - name: description
      content: Overview of the LightAccountClientActions on LightAccountClient
  - - meta
    - property: og:description
      content: Overview of the LightAccountClientActions on LightAccountClient
next:
  text: Utils
---

# LightAccountClientActions

`SmartAccountClient` actions used to interact with the [`LightAccount`](https://github.com/alchemyplatform/light-account/blob/main/src/LightAccount.sol) contract for the connected account. Used by extending the `LightAccount` connected `SmartAccountClient` with the `lightAccountClientActions` decorator.

```ts
export type LightAccountClientActions<
  TOwner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TOwner> | undefined =
    | LightAccount<TOwner>
    | undefined
> = {
  transferOwnership: (
    args: {
      newOwner: TOwner;
      waitForTxn?: boolean;
    } & GetAccountParameter<TAccount, LightAccount>
  ) => Promise<Hex>;
};
```

## Usage

<<< @/snippets/aa-accounts/lightAccountClient.ts

# transferOwnership

`transferOwnership` is an action on `LightAccountClientActions` which sends a UO that transfers the ownership of the account to a new owner, and returns either the UO hash or transaction hash.

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

<<< @/snippets/aa-accounts/lightAccountClient.ts
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
