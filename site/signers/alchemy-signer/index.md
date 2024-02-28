---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer
  - - meta
    - name: description
      content: Learn how to get started with the Alchemy Signer
  - - meta
    - property: og:description
      content: Learn how to get started with the Alchemy Signer
  - - meta
    - name: twitter:title
      content: Alchemy Signer
  - - meta
    - name: twitter:description
      content: Learn how to get started with the Alchemy Signer
---

# Alchemy Signer

The Alchemy Signer is a `SmartAccountSigner` that is powered by Alchemy's Signer Infrastructure. Using the Alchemy Signer, you can get started building embedded accounts with just an Alchemy API key!

## Usage

Once you have been granted access to the Alchemy Signer, getting started is really simple. Install the `@alchemy/aa-alchemy` package and initialize your signer:

<<< @/snippets/signers/alchemy/signer.ts

For other configuration options, see the [Alchemy Signer API Reference](/packages/aa-alchemy/signer/overview).

## Logging Users in

Once you have initialized your signer, you can now enable your users to create an account or login to their existing account.

::: code-group

<<< @/snippets/signers/alchemy/SignupLoginComponent.tsx

:::

Once your signer is authenticated with a user, you can use it to sign User Operations by creating a `SmartContractAccount` and passing the signer to it.

## Leveraging Persistent Sessions

By default the `AlchemySigner` leverages `localStorage` to cache user sessions for 15 minutes. This can be configured by passing in a `sessionConfig` to your `AlchemySigner` constructor.

You can check if a session exists by doing the following:
::: code-group

```ts
import { signer } from "./signer";

// NOTE: this method throws if there is no authenticated user
// so we return null in the case of an error
const user = await signer.getAuthDetails().catch(() => null);
```

<<< @/snippets/signers/alchemy/signer.ts
:::

If there is an existing session, then your signer is ready for use! If not, see the section above for logging users in.

## Using the Signer with Smart Contract Accounts

Once your signer is authenticated with a user, you can use it to sign User Operations by creating a `SmartContractAccount` and passing the signer to it. For example:

::: code-group

```ts
import { signer } from "./signer";

export const account = await createMultiOwnerModularAccount({
  transport: rpcTransport,
  chain,
  signer,
});
```

<<< @/snippets/signers/alchemy/signer.ts
:::

## Using the Signer as an EOA

::: warning
Note that EOA wallets will not have access to smart account features like gas sponsorship, batched transactions, multi-owner, or plugins. If you want to switch from EOA to smart accounts later, then each user will need to transfer their assets from the EOA account to a new smart account. It is not currently possible to "upgrade" and EOA to a smart contract account, although the community is discussing potential [EIPs](https://eips.ethereum.org/EIPS/eip-7377) to do that in the future.
:::

Because the Alchemy Signer has its own `address` and supports signing messages as raw hashes, it is possible to use this signer as an EOA directly. To do so, you can adapt the AlchemySigner to your library of choice and leverage its `signMessage`, `signTypedData`, and `signTransaction` methods directly. The public address of the signer can be accessed via `getAddress`.

If you are using viem, then you can use the `toViemAccount` method which will allow you to use the signer with a [`WalletClient`](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

::: code-group

```ts
import { signer } from "./signer";
import { createWalletClient, http } from "viem";
import { sepolia } from "@alchemy/aa-core";

export const walletClient = createWalletClient({
  transport: http("alchemy_rpc_url"),
  chain: sepolia,
  account: signer.toViemAccount(),
});
```

<<< @/snippets/signers/alchemy/signer.ts
:::
