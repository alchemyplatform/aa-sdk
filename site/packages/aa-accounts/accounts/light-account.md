---
outline: deep
head:
  - - meta
    - property: og:title
      content: LightAccount
  - - meta
    - name: description
      content: Overview of the LightAccount class in aa-accounts
  - - meta
    - property: og:description
      content: Overview of the LightAccount class in aa-accounts
---

# Light Account

`LightAccount` is a simple, [secure](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf), and [cost-effective](/smart-accounts/gas-benchmarks) smart account implementation which extends `SmartContractAccount`. It supports features such as ownership transfers, [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) message signing, and batched transactions.

In addition to the base [`SmartContractAccount`](/packages/aa-core/accounts/) methods, `LightAccount` has the following methods:

### Light Account cotract methods:

1.  [`getOwnerAddress`](/packages/aa-accounts/accounts/light-account#getOwnerAddress) -- returns the on-chain owner address of the account by calling [`owner`](https://github.com/alchemyplatform/light-account/blob/b2212114f8d4836835559dcfa6c51eb238415d53/src/LightAccount.sol#L220) method on `LightAccount` contract.
2.  [`encodeTransferOwnership`](/packages/aa-accounts/accounts/light-account#encodeTransferOwnership) -- encodes the [`transferOwnership`](https://github.com/alchemyplatform/light-account/blob/b2212114f8d4836835559dcfa6c51eb238415d53/src/LightAccount.sol#L176) function call using Light Account ABI.

# createLightAccount

`createLightAccount` is a factory that improves the developer experience of instantiating a Light Account using an EOA signer in one line of code.

## Usage

::: code-group

<<< @/snippets/aa-accounts/lightAccount.ts

:::

## Returns

### `Promise<LightAccount>`

A Promise containing a new `LightAccount`.

## Parameters

### `param: CreateLightAccountParams`

- `transport: Transport` -- a Viem [Transport](https://viem.sh/docs/glossary/types#transport) for interacting with JSON RPC methods.

- `chain: Chain` -- the chain on which to create the client.

- `owner: SmartAccountSigner` -- the owner EOA signer responsible for signing user operations on behalf of the smart account.

- `entryPoint: EntryPointDef` -- [optional] the entry point contract address. If not provided, the entry point contract address for the client is the connected account's entry point contract, or if not connected, falls back to the default entry point contract for the chain. See [getDefaultEntryPointAddress](/packages/aa-core/utils/getDefaultEntryPointAddress.html#getdefaultentrypointaddress).

- `factoryAddress: Address` -- [optional] the factory address for the smart account implementation, which is required for creating the account if not already deployed. Defaults to the [getDefaultLightAccountFactoryAddress](/packages/aa-accounts/utils/getDefaultLightAccountFactoryAddress.md)

- `initCode: Hex` -- [optional] the initCode for deploying the smart account with which the client will connect.

- `salt: bigint` -- [optional] a value that is added to the address calculation to allow for multiple accounts for the same owner. The default value supplied is `0n`. To see this calculation used in the smart contract, check out [the LightAccountFactory](https://github.com/alchemyplatform/light-account/blob/main/src/LightAccountFactory.sol#L30).

- `accountAddress: Address` -- [optional] a smart account address override that this object will manage instead of generating its own.

- `version: LightAccountVersion` -- [optional] the LightAccount contract version. Default: [v1.1.0](https://github.com/alchemyplatform/light-account/releases/tag/v1.1.0)

# getOwnerAddress

`getOwnerAddress` returns the address of the on-chain owner of the account.

## Usage

::: code-group

```ts [example.ts]
import { smartAccount } from "./lightAccount";

// [!code focus:99]
// get on-chain account owner address
const ownerAddress = await smartAccount.getOwnerAddress();
```

<<< @/snippets/aa-accounts/lightAccount.ts
:::

## Returns

### `Promise<Address>`

A Promise containing the address of the smart account's owner address.

# encodeTransferOwnership

`encodeTransferOwnership` is a static class method on the `LightSmartContractAccount` which generates the call data necessary to send a `UserOperation` calling `transferOwnership` on the connected smart contract account.

## Usage

::: code-group

```ts [example.ts]
import { smartAccount } from "./lightAccount";
// [!code focus:99]
// encode transfer ownership
const newOwner = LocalAccountSigner.mnemonicToAccountSigner(NEW_OWNER_MNEMONIC);
const encodedTransferOwnershipData =
  smartAccountClient.account.encodeTransferOwnership({ newOwner });
```

<<< @/snippets/aa-accounts/lightAccount.ts
:::

## Returns

### `Promise<Hex>`

A Promise containing the encoded Hex of the`transferOwnership` function call with the given parameter

## Parameters

### `newOwner: <Address>` -- the new owner to transfer ownership to for the smart account

## Developer links

- [Light Account & Simple Account Deployment Addresses](/smart-accounts/accounts/deployment-addresses)
- [Light Account Github Repo](https://github.com/alchemyplatform/light-account)
- [Quantstamp Audit Report](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf)
