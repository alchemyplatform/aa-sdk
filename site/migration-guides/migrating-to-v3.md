---
outline: deep
head:
  - - meta
    - property: og:title
      content: Migrating to aa-sdk v3
  - - meta
    - name: description
      content: How to upgrade through breaking changes of aa-sdk v3
  - - meta
    - property: og:description
      content: How to upgrade through breaking changes of aa-sdk v3.
  - - meta
    - name: twitter:title
      content: Migration Guide
  - - meta
    - name: twitter:description
      content: How to upgrade through breaking changes of aa-sdk v3.
---

# Migration Guide

Below are the steps to migrate your project from older versions of the `aa-sdk` to the latest version.

## Migrating to version 3.x.x

This version update brings a lot of breaking changes. As we began to support Modular Accounts and their interfaces, we realized that the previous version of the SDK was not as flexible as it could have been to handle the modularity of the new account interfaces.
To address this, version 3.x.x of the SDK switches to an approach more idiomatic to `viem`.

### Viem Version

We have updated our dependency to viem v2.x.x. This means you will need to update your project to use >= v2.5.0 of viem.

### Client: `SmartAccountProvider` → `SmartAccountClient`

The biggest change is that the `SmartAccountProvider` class has been removed and replaced with a `SmartAccountClient` type that extends `viem`'s [`Client`](https://viem.sh/docs/clients/custom). To get started with the new clients, you can do the following:

```ts
import { SmartAccountProvider } from "@alchemy/aa-core"; // [!code --]
import { getDefaultEntryPointAddress } from "@alchemy/aa-core"; // [!code --]
import { http } from "viem"; // [!code ++]
import { sepolia } from "@alchemy/aa-core";

const provider = new SmartAccountProvider({ // [!code --]
const client = createSmartAccountClient({ // [!code ++]
  rpcProvider: "RPC_URL", // [!code --]
  transport: http("RPC_URL"), // [!code ++]
  chain: sepolia,
  entryPointAddress: getDefaultEntryPointAddress(sepolia), // [!code --]
});
```

### Client: Removal of `with*` middleware override functions

The `SmartAccountProvider` in previous versions had a number of `with*` functions that mapped to the corresponding middleware functions on the provider.
The concept of the middlewares is still present in this version, but their configuration has been moved to the `SmartAccountClient` creator. For example,

```ts
import { SmartAccountProvider } from "@alchemy/aa-core"; // [!code --]
import { getDefaultEntryPointAddress } from "@alchemy/aa-core"; // [!code --]
import { http } from "viem"; // [!code ++]
import { sepolia } from "@alchemy/aa-core";

const provider = new SmartAccountProvider({ // [!code --]
const client = createSmartAccountClient({ // [!code ++]
    rpcProvider: "RPC_URL", // [!code --]
    transport: http("RPC_URL"), // [!code ++]
    chain: sepolia,
    entryPointAddress: getDefaultEntryPointAddress(sepolia), // [!code --]
}).withGasEstimator(async () => ({ // [!code --]
    gasEstimator: async (struct) => ({ // [!code ++]
        ...struct, // [!code ++]
        callGasLimit: 0n,
        preVerificationGas: 0n,
        verificationGasLimit: 0n,
    }), // [!code ++]
});
```

### Client: signature changes on methods

To support [the various ways](/migration-guides/migrating-to-v3#account-connecting-to-a-smart-account) of connecting to a smart account, the signatures of the methods on `SmartAccountClient` have changed. Almost all methods now have an optional param for `account` and have been converted into single argument functions that take an object with the their properties instead.

### Account: `BaseSmartContractAccount` → `SmartContractAccount`

The next big change is the removal of the class-based `BaseSmartContractAccount` that all accounts extended from. This has been replaced with a `SmartContractAccount` type that extends `viem`'s [`Account`](https://viem.sh/docs/accounts/custom), and instantiation of an account is now an `async` action. To get started with the new accounts (using `LightAccount` as an example), you will have to make the following changes:

```ts
import {
  LightSmartContractAccount, // [!code --]
  createLightAccount, // [!code ++]
  getDefaultLightAccountFactoryAddress, // [!code --]
} from "@alchemy/aa-accounts";
import {
  LocalAccountSigner,
  type Hex,
} from "@alchemy/aa-core";
import { sepolia } from "@alchemy/aa-core";

const chain = sepolia;

const account = new LightSmartContractAccount({ // [!code --]
const account = await createLightAccount({ // [!code ++]
    rpcClient: client, // [!code --]
    transport: http("RPC_URL"), // [!code ++]
    signer,
    chain,
    factoryAddress: getDefaultLightAccountFactoryAddress(chain), // [!code --]
  });
```

### Account: Connecting to a Smart Account

In earlier versions, a provider could not be used with a smart account until it was connected to one using `.connect`. In version 3.x.x, you have the option of keeping the two disconnected and passing the account to the client methods directly. You also have the option to hoist the account
so that you don't have to pass the account to every method.

#### Option 1: Passing the Account to the Client Methods

```ts
import { createLightAccount } from "@alchemy/aa-accounts";
import {
  createBundlerClient,
  createSmartAccountClientFromExisting
  LocalAccountSigner,
  type Hex,
} from "@alchemy/aa-core";
import { sepolia } from "@alchemy/aa-core";
import { custom, http } from "viem";

const chain = sepolia;

const client = createBundlerClient({
  chain,
  transport: http("JSON_RPC_URL"),
});

// [!code focus:99]
// createSmartAccountClientFromExisting is a helper method that allows you
// to reuse a JSON RPC client to create a Smart Account client.
const smartAccountClient = createSmartAccountClientFromExisting({
  client,
});

const account = await createLightAccount({
  signer,
  chain,
  transport: custom(client),
});

const { hash } = await smartAccountClient.sendUserOperation({
    uo: {
        target: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        data: "0x",
        value: 10n,
    },
    account, // [!code ++]
});
```

#### Option 2: Hoisting the Account

Hoisting the account is similar to using `.connect` in previous versions. You simply create your client with an account passed in to it.

```ts
import { createLightAccount } from "@alchemy/aa-accounts";
import {
  createBundlerClient,
  createSmartAccountClientFromExisting
  LocalAccountSigner,
  type Hex,
} from "@alchemy/aa-core";
import { sepolia } from "@alchemy/aa-core";
import { http, custom } from "viem";

const chain = sepolia;

const client = createBundlerClient({
  chain,
  transport: http("JSON_RPC_URL"),
});

// [!code focus:99]
const account = await createLightAccount({
  signer,
  transport: custom(client),
  chain,
});

const smartAccountClient = createSmartAccountClientFromExisting({
  account, // [!code ++]
  client,
});

const { hash } = await smartAccountClient.sendUserOperation({
  uo: {
    target: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    data: "0x",
    value: 10n,
  },
  account, // [!code --]
});
```

### Account: Custom Accounts

In prior versions, using your own smart contract account implementations required that you extend `BaseSmartContractAccount`. In version 3.x.x, you can use the `toSmartContractAccount` method which will allow you to use any account with `SmartAccountClient`. `toSmartContractAccount` has the form of:

```ts
type toSmartContractAccount = <
  Name extends string = string,
  TTransport extends Transport = Transport
>({
  transport,
  chain,
  source,
  entryPointAddress,
  accountAddress,
  getAccountInitCode,
  signMessage,
  signTypedData,
  encodeBatchExecute,
  encodeExecute,
  getDummySignature,
  signUserOperationHash,
  encodeUpgradeToAndCall,
}: ToSmartContractAccountParams<Name, TTransport>) => Promise<
  SmartContractAccount<Name>
>;
```

### Account: SimpleAccount and NaniAccount initialization params

`chain` and `transport` have been added to the constructor and `rpcClient` has been removed.

### Account: SimpleAccount and LightAccount intialization params

`index` is now called `salt`

### Signer: `signTypedData` signature change

The `signTypedData` method found on `SmartAccountSigner` has been updated to match the signature found on `SmartContractAccount` and viem's `Account`.

```ts
signTypedData: (params: SignTypedDataParams) => Promise<Hex>; // [!code --]

signTypedData: <
  const TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string
>(
  params: TypedDataDefinition<TTypedData, TPrimaryType>
) => Promise<Hex>;
```

### Ethers: Removed methods

The `with*` methods have been removed from the Provider and Signer classes.
The `connect` methods has been removed in favor of immutable properties on the Provider and Signer classes. See updated AccountSigner constructor below.

### Ethers: `getPublicErc4337Client` → `getBundlerClient`

The `getPublicErc4337Client` method has been renamed to `getBundlerClient` to match the naming found in `aa-core`.

### Ethers: Updated Signer Adapter constructor

The `AccountSigner` now takes in a `SmartContractAccount` as a param in its constructor.

### Core: Transition from ~~`Percent`~~ to `Multiplier` api and types

The `Percent` type and `PercentSchema` have been removed in favor of the `Multiplier` type and `MultiplierSchema`.

Going forward when using the feeOptions, you can specify the `Multiplier` type instead of a `Percent`. The `Multiplier` type is a number that represents direct multipliaction of the estimation. For example, `0.1` is 10% of the estimated value and `1` is 100% of the estimated value.

```ts
createModularAccountAlchemyClient({
    ...
    opts: {
      ...
      // The maxFeePerGas and maxPriorityFeePerGas estimated values will now be multipled by 1.5
      feeOptions: {
        // This was previously { percent: 50n }
        maxFeePerGas: { multiplier: 1.5 },
        // This was previously { percent: 25n }
        maxPriorityFeePerGas: { multiplier: 1.25 },
      },
    },
  });
```
