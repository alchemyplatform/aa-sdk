# `@alchemy/aa-core`

This package contains the core interfaces and components for interacting with 4337 infrastructure. The primary interfaces that it exports are the `SmartAccountProvider` and `BaseSmartContractAccount`.

The `SmartAccountProvider` is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant Provider that wraps JSON RPC methods and some Wallet Methods (signing, sendTransaction, etc). With this Provider, you can submit User Operations to RPC providers, estimate gas, configure a Paymaster, send standard JSON RPC requests, and more. It is not opinionated about which RPC provider you are using and is configurable to work with any RPC provider. Because it implements EIP-1193, it can be used with any web3 library.

The `BaseSmartContractAccount` interface defines how you would interact with your Smart Contract Account. Any class that extends `BaseSmartContractAccount` may also expose additional methods that allow its connecting `SmartAccountProvider` to provide ergonomic utilities for building and submitting `User Operation`s.

## Getting started

To get started, first install the package:

```bash [yarn]
yarn add @alchemy/aa-core
```

```bash [npm]
npm i -s @alchemy/aa-core
```

```bash [pnpm]
pnpm i @alchemy/aa-core
```

## Usage

You can create a provider like so:

```typescript
import { createMultiOwnerModularAccount } from "@alchemy/aa-accounts";
import {
  LocalAccountSigner,
  SmartAccountSigner,
  createSmartAccountClient,
  polygonMumbai,
} from "@alchemy/aa-core";
import { http } from "viem";

const chain = polygonMumbai;
const signer: SmartAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
  "YOUR_OWNER_MNEMONIC"
);
const rpcTransport = http("https://polygon-mumbai.g.alchemy.com/v2/demo");

export const smartAccountClient = createSmartAccountClient({
  transport: rpcTransport,
  chain,
  account: await createMultiOwnerModularAccount({
    transport: rpcTransport,
    chain,
    signer,
  }),
});
```
