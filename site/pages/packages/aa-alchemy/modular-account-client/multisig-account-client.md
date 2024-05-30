---
title: createMultisigAccountAlchemyClient
description: Overview of the createMultisigAccountAlchemyClient factory in aa-alchemy
---

# createMultisigAccountAlchemyClient

`createMultisigAccountAlchemyClient` is a factory that improves the developer experience of connecting a Modular Account with the multisig plugin to an `AlchemySmartAccountClient` via an optional dependency on the [`@alchemy/aa-accounts`](https://github.com/alchemyplatform/aa-sdk/tree/development/packages/accounts) package. You can use this to directly instantiate an `AlchemySmartAccountClient` already connected to a Modular Account with the multisig plugin in one line of code.

## Usage

```ts
import { LocalAccountSigner } from "@alchemy/aa-core";
import { createMultisigAccountAlchemyClient } from "@alchemy/aa-alchemy";

// Creating a 3/3 multisig account
const signers = [LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 0 }
  ), LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 1 }
  ), LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 2 }
  )];

const threshold = 3n;

const owners = await Promise.all(
  signers.map((s) => s.getAddress()),
);

const multisigAccountClient = createMultisigAccountAlchemyClient({
    chain,
    signers[0],
    owners,
    threshold,
    apiKey: "YOUR_API_KEY",
  });
```

## Returns

### `Promise<AlchemySmartAccountClient>`

A `Promise` containing a new `AlchemySmartAccountClient` connected to a Modular Account with the multisig plugin.

## Parameters

### `config: AlchemyMultisigAccountClientConfig`

- `rpcUrl: string | undefined | never` -- a JSON-RPC URL. This is required if there is no `apiKey`.

- `apiKey: string | undefined | never` -- an Alchemy API Key. This is required if there is no `rpcUrl` or `jwt`.

- `jwt: string | undefined | never` -- an Alchemy JWT (JSON web token). This is required if there is no `apiKey`.

- `useSimulation: boolean` -- [optional] -- whether or not to simulate User Operations before sending them to ensure they don't revert

- `gasManagerConfig: AlchemyGasManagerConfig` -- [optional] if you want to use Alchemy's gas manager to sponsor gas.

  - `policyId: string` -- the policy id of the gas manager you want to use.
  - `gasEstimationOptions: AlchemyGasEstimationOptions` -- [optional] optional option configurable for the gas estimation portion of the Alchemy gas manager

- `...accountParams`: CreateMultisigModularAccountParams -- additional parameters to pass to the `createMultisigModularAccount`.

  - `transport: Transport` -- a Viem [Transport](https://viem.sh/docs/glossary/types#transport) for interacting with JSON RPC methods.
  - `chain: Chain` -- the chain on which to create the client.
  - `signer: SmartAccountSigner` -- the signer to connect to the account with for signing user operations on behalf of the smart account.
  - `threshold: bigint` -- the number of signatures required to perform an action on the smart account.
  - `owners: Address[]` -- [optional] the addresses of the owners of the multisig account.
  - `accountAddress: Address` -- [optional] a smart account address override that this object will manage instead of generating its own.
  - `initCode: Hex` -- [optional] the initCode for deploying the smart account with which the client will connect.
  - `entryPoint: EntryPointDef` -- [optional] the entry point contract address. If not provided, the entry point contract address for the client is the connected account's entry point contract, or if not connected, falls back to the default entry point contract for the chain. See [getDefaultEntryPointAddress](/packages/aa-core/utils/getDefaultEntryPointAddress#getdefaultentrypointaddress).
  - `factoryAddress: Address` -- [optional] the factory address for the smart account implementation, which is required for creating the account if not already deployed. Defaults to the modular account multisig factory address.
  - `salt: bigint` -- [optional] a value that is added to the address calculation to allow for multiple accounts for the same signer (owner). The default value supplied is `0n`.

- `...clientParams` -- [optional] additional parameters to pass to the [`SmartAccountClient`](/packages/aa-core/smart-account-client/) constructor.
