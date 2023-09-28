---
outline: deep
head:
  - - meta
    - property: og:title
      content: EOA
  - - meta
    - name: description
      content: Guide to using and EOA as a signer
  - - meta
    - property: og:description
      content: Guide to using and EOA as a signer
---

# Externally Owned Accounts

An Externally Owned Account (EOA) is a regular Ethereum account that is controlled by a private key. This is the most common type of account, and is what you are used to when using MetaMask or other wallets. The Account Kit supports EOAs as signers and the process for connecting an EOA is simple, but can depend on how you are connecting to the EOA in your dApp.

## Integration

In this example we'll use `viem` in two ways. The first way allows you to connect to an EOA over JSON RPC and the second allows you to connect to so called "Local Accounts". A Local Account is an EOA for which you have access to the private key on the client.

### JSON RPC

A JSON RPC based account is one where the key material is not available locally, but on some external client (eg. Metamask extension or hardware wallet).

```ts
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";
import { WalletClientSigner } from "@alchemy/core";

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum),
});

// this can now be used as an owner for a Smart Contract Account
export const eoaSigner = new WalletClientSigner(client);
```

### Local Account

In this example we assume you have access to the private key locally.

```ts
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
// import { mnemonicToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { WalletClientSigner } from "@alchemy/core";

// if you have a mnemonic, viem also exports a mnemonicToAccount function (see above import)
const account = privateKeyToAccount("0x...");

// This client can now be used to do things like `eth_requestAccounts`
export const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
});

// this can now be used as an owner for a Smart Contract Account
export const eoaSigner = new WalletClientSigner(client);
```
