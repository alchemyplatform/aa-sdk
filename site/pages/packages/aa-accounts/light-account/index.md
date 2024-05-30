---
title: LightAccount
description: Overview of the LightAccount class in aa-accounts
---

# Light Account

`LightAccount` is a simple, secure, and cost-effective smart account implementation which extends `SmartContractAccount`. It supports features such as ownership transfers, [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) message signing, and batched transactions. We recommend using Light Account for most use cases.

The additional methods supported by `LightAccount` are:

1.  [`signMessageWith6492`](/packages/aa-accounts/light-account/signMessageWith6492) -- supports message signatures for deployed smart accounts, as well as undeployed accounts (counterfactual addresses) using [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492).
2.  [`signTypedData`](/packages/aa-accounts/light-account/signTypedData) -- supports typed data signatures from the smart account's current signer address.
3.  [`signTypedDataWith6492`](/packages/aa-accounts/light-account/signTypedDataWith6492) -- supports typed data signatures for deployed smart accounts, as well as undeployed accounts (counterfactual addresses) using ERC-6492.
4.  [`getOwnerAddress`](/packages/aa-accounts/light-account/getOwnerAddress) -- returns the on-chain owner address of the account.
5.  [`encodeTransferOwnership`](/packages/aa-accounts/light-account/encodeTransferOwnership) -- encodes the transferOwnership function call using Light Account ABI.
6.  [`transferOwnership`](/packages/aa-accounts/light-account/actions/transferOwnership) -- transfers ownership of the account to a new owner, and returns either the UO hash or transaction hash.

## Usage

:::code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";

// [!code focus:99]
// sign message (works for undeployed and deployed accounts)
const signedMessageWith6492 = await smartAccountClient.signMessageWith6492(
  "test"
);

// sign typed data
const signedTypedData = await smartAccountClient.signTypedData("test");

// sign typed data (works for undeployed and deployed accounts), using
const signedTypedDataWith6492 = await smartAccountClient.signTypedDataWith6492({
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
});

// get on-chain account owner address
const ownerAddress = await smartAccountClient.account.getOwnerAddress();
const accountAddress = smartAccountClient.getAddress();

// transfer ownership
const newOwner = LocalAccountSigner.mnemonicToAccountSigner(NEW_OWNER_MNEMONIC);
const hash = await smartAccountClient.transferOwnership({
  newOwner,
  waitForTxn: true, // wait for txn with UO to be mined
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

# createLightAccount

`createLightAccount` is a factory that improves the developer experience of creating Light Account. You can use this to directly instantiate a `LightAccount` in one line of code.

## Usage

```ts
// [!include ~/snippets/aa-accounts/lightAccountClient.ts]
```

## Returns

### `Promise<LightAccount>`

A `Promise` containing a new `LightAccount`.

## Parameters

### `param: CreateLightAccountParams`

- `transport: Transport` -- a Viem [Transport](https://viem.sh/docs/glossary/types#transport) for interacting with JSON RPC methods.

- `chain: Chain` -- the chain on which to create the client.

- `signer: SmartAccountSigner` -- the signer to connect to the account with for signing user operations on behalf of the smart account.

- `entryPoint: EntryPointDef` -- [optional] the entry point contract address. If not provided, the entry point contract address for the client is the connected account's entry point contract, or if not connected, falls back to the default entry point contract for the chain. See [getDefaultEntryPointAddress](/packages/aa-core/utils/getDefaultEntryPointAddress#getdefaultentrypointaddress).

- `factoryAddress: Address` -- [optional] the factory address for the smart account implementation, which is required for creating the account if not already deployed. Defaults to the [getDefaultLightAccountFactoryAddress](/packages/aa-accounts/utils/getDefaultLightAccountFactoryAddress)

- `initCode: Hex` -- [optional] the initCode for deploying the smart account with which the client will connect.

- `salt: bigint` -- [optional] a value that is added to the address calculation to allow for multiple accounts for the same signer (owner). The default value supplied is `0n`. To see this calculation used in the smart contract, check out [the LightAccountFactory](https://github.com/alchemyplatform/light-account/blob/main/src/LightAccountFactory.sol#L30).

- `accountAddress: Address` -- [optional] a smart account address override that this object will manage instead of generating its own.

- `version: LightAccountVersion` -- [optional] the LightAccount contract version. Default: [v1.1.0](https://github.com/alchemyplatform/light-account/releases/tag/v1.1.0)

## Developer links

- [Light Account Deployment Addresses](/smart-accounts/light-account/#deployment-addresses)
- [Light Account Github Repo](https://github.com/alchemyplatform/light-account)
- [Quantstamp Audit Report](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf)
