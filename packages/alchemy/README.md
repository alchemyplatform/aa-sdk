# `@alchemy/aa-alchemy`

This package contains `AlchemySmartAccountClient`, an implementation of `SmartAccountClient` interface defined in `aa-core`. It also contains middleware for accessing the Alchemy Gas Manager (an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) Paymaster) for doing Fee Estimates according to the expectations of the Alchemy [Rundler](https://github.com/alchemyplatform/rundler/tree/main) (an ERC-4337 Bundler). You may also find the util methods helpful. This repo is community-maintained and we welcome contributions!

## Getting started

If you are already using the `@alchemy/aa-core` package, you can simply install this package and start using the `AlchemySmartAccountClient`. If you are not using `@alchemy/aa-core` yet, you can install it and follow the instructions in the ["Getting started"](https://accountkit.alchemy.com/packages/aa-alchemy/) docs to get started.

```bash [yarn]
yarn add @alchemy/aa-alchemy
```

```bash [npm]
npm i -s @alchemy/aa-alchemy
```

```bash [pnpm]
pnpm i @alchemy/aa-alchemy
```

## Usage

You can create `AlchemySmartAccountClient` like so:

```typescript
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { sepolia } from "@alchemy/aa-core";

const chain = sepolia;
const PRIVATE_KEY = "0xYourEOAPrivateKey";
const eoaSigner: SmartAccountSigner =
  LocalAccountSigner.privateKeyToAccountSigner(`0x${PRIVATE_KEY}`);

export const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY", // replace with your alchemy api key of the Alchemy app associated with the Gas Manager, get yours at https://dashboard.alchemy.com/
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      signer: eoaSigner,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
    })
);
```
