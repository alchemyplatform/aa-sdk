---
title: Alchemy Signer • Overview
description: Learn how to get started with the Alchemy Signer
---

# AlchemySigner

The Alchemy Signer is a `SmartAccountSigner` that is powered by Alchemy's Signer Infrastructure. Using the Alchemy Signer, you can get started building embedded accounts with just an Alchemy API key!

## Usage

Once you have enabled the Alchemy Signer in the [dashboard](https://dashboard.alchemy.com/accounts?a=account-kit-docs), getting started is really simple. Install the `@alchemy/aa-alchemy` package and initialize your signer:

```ts
// [!include ~/snippets/signers/alchemy/signer.ts]
```

### Using the Signer with Smart Contract Accounts

Once your signer is authenticated with a user, you can use it to sign User Operations by creating a `SmartContractAccount` and passing the signer to it. For example:

:::code-group

```ts [example.ts]
import { signer } from "./signer";

export const account = await createMultiOwnerModularAccount({
  transport: rpcTransport,
  chain,
  signer,
});
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

### Using the Signer as an EOA

:::warning
Note that EOA wallets will not have access to smart account features like gas sponsorship, batched transactions, multi-owner, or plugins. If you want to switch from EOA to smart accounts later, then each user will need to transfer their assets from the EOA account to a new smart account. It is not currently possible to "upgrade" an EOA to a smart contract account, although the community is discussing potential [EIPs](https://eips.ethereum.org/EIPS/eip-7377) to do that in the future.
:::

Because the Alchemy Signer has its own `address` and supports signing messages as raw hashes, it is possible to use this signer as an EOA directly. To do so, you can adapt the Alchemy Signer to your library of choice and leverage its `signMessage`, `signTypedData`, and `signTransaction` methods directly. The public address of the signer can be accessed via `getAddress`.

If you are using viem, then you can use the `toViemAccount` method which will allow you to use the signer with a [`WalletClient`](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

:::code-group

```ts [walletClient.ts]
import { signer } from "./signer";
import { createWalletClient, http } from "viem";
import { sepolia } from "@alchemy/aa-core";

export const walletClient = createWalletClient({
  transport: http("alchemy_rpc_url"),
  chain: sepolia,
  account: signer.toViemAccount(),
});
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Returns

`AlchemySigner` -- an instance of the AlchemySigner that can be used as a signer on `SmartContractAccount` instances

## Parameters

`AlchemySignerParams` -- an object that contains the following properties:

- `client: AlchemySignerClient | AlchemySignerClientParams` -- the underlying client to use for the signer. The `AlchemySignerClientParams` are defined as follows:
  - `connection: ConnectionConfig` -- the api config to use for calling Alchemy's APIs.
  - `iframeConfig: IframeConfig` -- the config to use for the iframe that will be used to interact with the signer.
    - `iframeElementId?: string` -- the id of the iframe element that will be injected into the DOM [default: "turnkey-iframe"]
    - `iframeContainerId: string` -- the id of the iframe container that you have injected into your DOM
- `sessionConfig?: SessionConfig` -- optional parameter used to configure user sessions
  - `sessionKey?: string` -- the key that the session will be stored to in your chosen storage [default: "alchemy-signer-session"]
  - `storage?: "localStorage" | "sessionStorage"` -- the storage to use for the session [default: "localStorage"]
  - `expirationTimeMs?: number` -- the time in milliseconds that the session will be valid for [default: 15 minutes]
