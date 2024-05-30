---
title: LightSmartContractAccount • transferOwnership
description: Overview of the transferOwnership method on LightSmartContractAccount
---

# transferOwnership

`transferOwnership` is an action exported by `@alchemy/aa-accounts` which sends a UO that transfers ownership of the account to a new owner, and returns either the UO hash or transaction hash.

## Usage

:::code-group

```ts [example.ts]
import { smartAccountClient } from "./lightAccountClient";
// [!code focus:99]
const accountAddress = smartAccountClient.getAddress();

// transfer ownership
const newOwner = LocalAccountSigner.mnemonicToAccountSigner(NEW_OWNER_MNEMONIC);
const hash = await smartAccountClient.transferOwnership({
  newOwner,
  waitForTxn: true,
});
// after transaction is mined on the network,
// create a new light account client for the transferred Light Account
const transferredClient = await createLightAccountClient({
  transport: custom(smartAccountClient),
  chain: smartAccountClient.chain,
  signer: newOwner,
  accountAddress, // NOTE: You MUST to specify the original smart account address to connect using the new owner/signer
});
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-accounts/lightAccountClient.ts]
```

:::

## Returns

### `Promise<0x${string}>`

A `Promise` that resolves to the user operation hash (transaction hash if `waitForTx` is true) which transferred ownership of the smart account's owner

## Parameters

- `client: SmartAccountClient` -- the client to use to send the transaction
- `options: TransferLightAccountOwnershipParams` -- the options to use to transfer ownership
  - `newOwner: TSigner extends SmartAccountSigner = SmartAccountSigner` -- the new on-chain owner of the account
  - `waitForTxn?: boolean` -- optionally, wait for the transaction to be mined with the UO
  - `account?: LightAccount` -- optionally, pass the account if your client is not connected to it
