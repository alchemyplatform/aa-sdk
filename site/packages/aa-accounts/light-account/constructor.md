---
outline: deep
head:
  - - meta
    - property: og:title
      content: LightSmartContractAccount • constructor
  - - meta
    - name: description
      content: Overview of the constructor method on LightSmartContractAccount in aa-accounts
  - - meta
    - property: og:description
      content: Overview of the constructor method on LightSmartContractAccount in aa-accounts
---

# constructor

To initialize a `LightSmartContractAccount`, you must provide a set of parameters detailed below.

Note that there is no difference in constructor arguments used for `LightSmartContractAccount` when compared to `SimpleSmartContractAccount`.

## Usage

::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import {
  LocalAccountSigner,
  getDefaultEntryPointAddress,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { sepolia } from "viem/chains";

const PRIVATE_KEY = "0xYourEOAPrivateKey";
const eoaSigner: SmartAccountSigner =
  LocalAccountSigner.privateKeyToAccountSigner(`0x${PRIVATE_KEY}`);

// instantiates using every possible parameter, as a reference
export const account = new LightSmartContractAccount({
  rpcClient: "ALCHEMY_RPC_URL",
  chain: sepolia,
  factoryAddress: getDefaultLightAccountFactoryAddress(sepolia),
  owner: eoaSigner,
  entryPointAddress: getDefaultEntryPointAddress(sepolia),
  accountAddress: "0xYourSmartAccountAddress",
  index: 0n,
});
```

:::

## Returns

### `LightSmartContractAccount`

A new instance of a `LightSmartContractAccount`.

## Parameters

### `params: SimpleSmartAccountParams`

- `rpcClient: string | PublicErc4337Client` -- a JSON-RPC URL, or a viem Client that supports ERC-4337 methods and Viem public actions. See [createPublicErc4337Client](/packages/aa-core/client/createPublicErc4337Client.md).

- `chain: Chain` -- the chain on which to create the provider.

- `factoryAddress: Address` -- the factory address for the smart account implementation, which is required for creating the account if not already deployed.

- `owner: SmartAccountSigner` -- the owner EOA address responsible for signing user operations on behalf of the smart account.

- `entryPointAddress: Address | undefined` -- [optional] entry point contract address. If not provided, the entry point contract address for the provider is the connected account's entry point contract, or if not connected, falls back to the default entry point contract for the chain. See [getDefaultEntryPointAddress](/packages/aa-core/utils/getDefaultEntryPointAddress.html#getdefaultentrypointaddress).

- `accountAddress: Address | undefined` -- [optional] a smart account address override that this object will manage instead of generating its own.

- `index: bigint | undefined` -- [optional] additional salt value used when creating the smart account.
