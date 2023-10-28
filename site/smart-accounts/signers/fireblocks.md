---
outline: deep
head:
  - - meta
    - property: og:title
      content: Fireblocks
  - - meta
    - name: description
      content: Guide for using Fireblocks as a signer
  - - meta
    - property: og:description
      content: Guide for using Fireblocks as a signer
---

# Fireblocks

[Fireblocks](https://www.fireblocks.com/) is an enterprise grade MPC wallet provider providing industry's most secure custodial and non-custodial wallets. Fireblocks has created a multi-layer security matrix that layers MPC, secure enclaves, our signature Policy Engine, and an asset transfer network to provide the strongest software and hardware defense available against evolving attack vectors.

Fireblocks' security structure provides a truly secure environment for storing, transferring, and issuing digital assets. This ensures that your assets are protected from cyberattacks, internal colluders, and human errors. As a result, Fireblocks serves as the foundation for thousands of digital asset businesses and has securely transferred over $3T in digital assets.

Fireblocks' MPC wallets are EOA accounts, which in any account abstraction enabled wallet is the root of their security & trust model. Using Fireblocks MPC based EOA wallets in combination with the Alchemy Account Kit will give you the best of both worlds; Enterprise grade security for securing your off-chain key material, and the utmost flexibility of your on-chain Smart Accounts

# Integrataion

### Install the Fireblocks Web3 Provider

::: code-group

```bash [npm]
npm i -s @fireblocks/fireblocks-web3-provider
```

```bash [yarn]
yarn add @fireblocks/fireblocks-web3-provider
```

:::

### Create a SmartAccountSigner

Next, setup the Fireblocks Web3 Provider and create a `SmartAccountSigner`:

<<< @/snippets/fireblocks.ts

### Use it with LightAccount

Let's see it in action with `aa-alchemy` and `LightSmartContractAccount` from `aa-accounts`:
::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { LightSmartContractAccount } from "@alchemy/aa-accounts";
import { sepolia } from "viem/chains";
import { fireblocksSigner } from "./fireblocks";

const chain = sepolia;
const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY",
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: "0x...",
      chain: rpcClient.chain,
      owner: fireblocksSigner,
      factoryAddress: "0x...",
      rpcClient,
    })
);
```

<<< @/snippets/fireblocks.ts

:::
