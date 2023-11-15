---
outline: deep
head:
  - - meta
    - property: og:title
      content: LightSmartContractAccount
  - - meta
    - name: description
      content: Overview of the LightSmartContractAccount class in aa-accounts
  - - meta
    - property: og:description
      content: Overview of the LightSmartContractAccount class in aa-accounts
---

# Light Account

`LightSmartContractAccount` is a simple, secure, and cost-effective smart account implementation which extends `SimpleSmartContractAccount` as an implementation of `BaseSmartContractAccount`. It supports features such as owner transfers, [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) message signing, and batched transactions. We recommend using Light Account for most use cases.

Notable differences between `LightSmartContractAccount` and `SimpleSmartContractAccount` are implementations for:

1.  [`signMessageWith6492`](/packages/aa-accounts/light-account/signMessageWith6492) -- supports message signatures for deployed smart accounts, as well as undeployed accounts (counterfactual addresses) using [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492).
2.  [`signTypedData`](/packages/aa-accounts/light-account/signTypedData) -- supports typed data signatures from the smart account's owner address.
3.  [`signTypedDataWith6492`](/packages/aa-accounts/light-account/signTypedDataWith6492) -- supports typed data signatures for deployed smart accounts, as well as undeployed accounts (counterfactual addresses) using ERC-6492.
4.  [`getOwnerAddress`](/packages/aa-accounts/light-account/getOwnerAddress) -- returns the on-chain owner address of the account.
5.  [`encodeTransferOwnership`](/packages/aa-accounts/light-account/encodeTransferOwnership) -- encodes the transferOwnership function call using Light Account ABI.
6.  [`transferOwnership`](/packages/aa-accounts/light-account/transferOwnership) -- transfers ownership of the account to a new owner, and returns either the UO hash or transaction hash.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
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

// get owner address
const owner = await provider.account.getOwnerAddress();

// encode transfer pownership
const newOwner = LocalAccountSigner.mnemonicToAccountSigner(NEW_OWNER_MNEMONIC);
const encodedTransferOwnershipData =
  LightSmartContractAccount.encodedTransferOwnership(newOwner);

// transfer ownership
const result = await LightSmartContractAccount.transferOwnership(
  provider,
  newOwner
  true, // wait for txn with UO to be mined
);
```

<<< @/snippets/provider.ts
:::

## Developer Links

- [Light Account & Simple Account Deployment Addresses](/smart-accounts/accounts/deployment-addresses)
- [Light Account Github Repo](https://github.com/alchemyplatform/light-account)
- [Quantstamp Audit Report](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf)
