---
outline: deep
head:
  - - meta
    - property: og:title
      content: AlchemyProvider
  - - meta
    - name: description
      content: Overview of the AlchemyProvider class in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the AlchemyProvider class in aa-alchemy
---

# Utils

`aa-alchemy` offers util methods to speed up your development with AlchemyProvider.

Notable util methods include:

1.  [`SupportedChains`](/packages/aa-alchemy/utils/supportedchains) -- calls `eth_estimateUserOperationGas` and returns the result.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";

// sign message (works for undeployed and deployed accounts)
const signedMessageWith6492 = provider.signMessageWith6492("test");

// sign typed data
const signedTypedData = provider.signTypedData("test");

// sign typed data (works for undeployed and deployed accounts), using
const signedTypedDataWith6492 = provider.signTypedDataWith6492({
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
});

// get owner
const owner = provider.account.getOwner();

// encode transfer pownership
const newOwner = LocalAccountSigner.mnemonicToAccountSigner(NEW_OWNER_MNEMONIC);
const encodedTransferOwnershipData =
  LightSmartContractAccount.transferOwnership(newOwner);

// transfer ownership
const result = await LightSmartContractAccount.transferOwnership(
  provider,
  newOwner
  true, // wait for txn with UO to be mined
);
```

<<< @/snippets/provider.ts
:::
