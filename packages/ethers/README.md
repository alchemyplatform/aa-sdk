# `@alchemy/aa-ethers`

This package contains `EthersProviderAdapter` and `AccountSigner`, respective extensions of the [`JsonRpcProvider`](https://docs.ethers.org/v5/api/providers/jsonrpc-provider/) and [`Signer`](https://docs.ethers.org/v5/api/signer/) classes defined in [`ethers.js`](https://docs.ethers.org/v5/) external library.

If you currently rely `ethers.js` for web3 development, you can use these `ethers.js`-compatible `JsonRpcProvider` and `Signer` to integrate Account Abstraction into your dApp. You may also find the [`util`](https://accountkit.alchemy.com/packages/aa-ethers/utils/introduction.html) methods helpful.

This repo is community maintained and we welcome contributions!

## Getting started

If you are already using the `@alchemy/aa-core` package, you can simply install this package and start using the `EthersProviderAdapter` and `AccountSigner`. If you are not using `@alchemy/aa-core`, you can install it and follow the instructions in the ["Getting Started"](https://accountkit.alchemy.com/packages/aa-ethers/) docs to get started.

```bash [yarn]
yarn add @alchemy/aa-ethers
```

```bash [npm]
npm i -s @alchemy/aa-ethers
```

```bash [pnpm]
pnpm i @alchemy/aa-ethers
```

## Usage

You can create a provider and connect it to a signer account like so:

```typescript ethers-provider.ts
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { EthersProviderAdapter } from "@alchemy/aa-ethers";
import { LocalAccountSigner, SmartAccountSigner } from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";
import { polygonMumbai } from "viem/chains";

const chain = polygonMumbai;

// 1. Create a provider using EthersProviderAdapter
const alchemy = new Alchemy({
  apiKey: process.env.API_KEY!,
  network: Network.MATIC_MUMBAI,
});
const ethersProvider = await alchemy.config.getProvider();

const provider = EthersProviderAdapter.fromEthersProvider(ethersProvider);

const owner: SmartAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
  process.env.YOUR_OWNER_MNEMONIC!
);

// 2. Connect the provider to the smart account signer
export const signer = provider.connectToAccount(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
      owner,
    })
);
```
