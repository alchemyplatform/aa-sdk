---
outline: deep
head:
  - - meta
    - property: og:title
      content: Fireblocks Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use Fireblocks as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this integration guide to use Fireblocks as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Fireblocks Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use Fireblocks as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Fireblocks

[Fireblocks](https://www.fireblocks.com/) is an enterprise grade MPC wallet provider providing industry's most secure custodial and non-custodial wallets. Fireblocks has created a multi-layer security matrix that layers MPC, secure enclaves, our signature Policy Engine, and an asset transfer network to provide the strongest software and hardware defense available against evolving attack vectors.

Fireblocks' security structure provides a truly secure environment for storing, transferring, and issuing digital assets. This ensures that your assets are protected from cyberattacks, internal colluders, and human errors. As a result, Fireblocks serves as the foundation for thousands of digital asset businesses and has securely transferred over $3T in digital assets.

Fireblocks' MPC wallets are EOA accounts, which in any account abstraction enabled wallet is the root of their security & trust model. Using Fireblocks MPC based EOA wallets in combination with the Account Kit will give you the best of both worlds; Enterprise grade security for securing your off-chain key material, and the utmost flexibility of your on-chain smart accounts.

# Integration

### Install the Fireblocks Web3 Provider

Using `FireblocksSigner` in the `aa-signers` package requires installation of the [`@fireblocks/fireblocks-web3-provider`](https://github.com/fireblocks/fireblocks-web3-provider) SDK. `aa-signers` lists it as optional dependency.

::: code-group

```bash [npm]
npm i -s @fireblocks/fireblocks-web3-provider
```

```bash [yarn]
yarn add @fireblocks/fireblocks-web3-provider
```

::: warning Note
Due to how Fireblocks parses a private key [in their SDK](https://github.com/fireblocks/fireblocks-web3-provider/blob/main/src/provider.ts#L106-L116), you must specific the private key in [PEM Format](https://docs.progress.com/bundle/datadirect-hybrid-data-pipeline-installation-46/page/PEM-file-format.html#:~:text=A%20PEM%20encoded%20file%20includes,%2D%2D%2D%2D%2D%22.) if you chose to use `FireblocksSigner` in your app's client. Otherwise, if you choose `FireblocksSigner` in your app's server, you can also specify a path to a file containing your private key.
:::

### Create a SmartAccountSigner

Next, setup the Fireblocks SDK and create an authenticated `FireblocksSigner` using the `aa-signers` package:

<<< @/snippets/fireblocks.ts

### Use it with Light Account

Let's see it in action with `aa-alchemy` and `LightSmartContractAccount` from `aa-accounts`:
::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { sepolia } from "@alchemy/aa-core";
import { createFireblocksSigner } from "./fireblocks";

const chain = sepolia;
const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY",
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain: rpcClient.chain,
      owner: await createFireblocksSigner(),
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
    })
);
```

<<< @/snippets/fireblocks.ts

:::
