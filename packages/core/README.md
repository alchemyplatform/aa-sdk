# `@alchemy/aa-core`

This package contains the core interfaces and components for interacting with 4337 infrastructure. The primary interfaces that it exports are the `SmartAccountProvider` and `BaseSmartContractAccount`.

The `SmartAccountProvider` is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant Provider that wraps JSON RPC methods and some Wallet Methods (signing, sendTransaction, etc). With this Provider, you can submit User Operations to RPC providers, estimate gas, configure a Paymaster, send standard JSON RPC requests, and more. It is not opinionated about which RPC provider you are using and is configurable to work with any RPC provider. Because it implements EIP-1193, it can be used with any web3 library.

The `BaseSmartContractAccount` interface defines how you would interact with your Smart Contract Account. Any class that extends `BaseSmartContractAccount` may also expose additional methods that allow its connecting `SmartAccountProvider` to provide ergonic utilities for building and submitting `User Operation`s.

## Getting Started

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
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import {
  LocalAccountSigner,
  SmartAccountProvider,
  SmartAccountSigner,
} from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";

const chain = polygonMumbai;
const owner: SmartAccountSigner =
  LocalAccountSigner.mnemonicToAccountSigner(YOUR_OWNER_MNEMONIC);

export const provider = new SmartAccountProvider({
  rpcProvider: "https://polygon-mumbai.g.alchemy.com/v2/demo",
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
      owner,
    })
);
```
