---
outline: deep
head:
  - - meta
    - property: og:title
      content: Getting Started Guide
  - - meta
    - name: description
      content: Learn how to get started with Alchemy's Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Learn how to get started with Alchemy's Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Getting Started Guide
  - - meta
    - name: twitter:description
      content: Learn how to get started with Alchemy's Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Getting Started

This guide will help you get started with Account Kit by setting up your environment, creating a Smart Account, and sending a `UserOperation` on its behalf. By the end of this guide, you'll have a basic understanding of how to use the SDK and where to look for more advanced use cases.

## 1. Install the Packages

In your project directory, you'll need to install the required packages:

::: code-group

```bash [npm]
npm install @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem
```

```bash [yarn]
yarn add @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem
```

::: tip Note

We're installing [viem](https://viem.sh/) as well. Viem contains helpful abstractions and modules that will come in handy when using Account Kit. Additionally, many Account Kit modules use `viem` themselves.

:::

## 2. Use Account Kit to Send a User Operation

Using the SDK in the following example, we'll deploy a Smart Account and send a User Operation on its behalf.

<<< @/snippets/light-account.ts

To run the example, check your project's `package.json` file for correct script command. For instance, if your `package.json` has a script called `start` which runs the example file in a `node` environment, you can do:

::: code-group

```bash [npm]
npm start
```

```bash [yarn]
yarn start
```

:::

::: tip Remember

1. Get an `ALCHEMY_API_KEY` from the [Alchemy Dashboard](https://dashboard.alchemy.com/).
2. Use an actual EOA private key, or consider using a [Signer](/smart-accounts/signers/choosing-a-signer) to own the smart account.
3. Fund your smart account with some ETH to send `UserOperation`s on its behalf. For testnets like Sepolia in this example, you can use the [Alchemy Faucet](https://sepoliafaucet.com/). Consider instead sponsoring `UserOperation`s with the [Alchemy Gas Manager](/guides/sponsoring-gas/sponsoring-gas).
4. Adjust the `target` and `data` fields in the `sendUserOperation` function to match your requirements. Look at our [How to Send a User Operation](/guides/send-user-operation) guide for an example using NFT mints.

:::

## 3. Dive Deeper

In this guide we initialized an `AlchemyProvider` with the `aa-alchemy` package however we could have done the same with the other packages of Account Kit as well.

1. To learn more about the different packages and their use cases, check out the ["Packages Overview"](/overview/package-overview) page.

2. To learn about the end-to-end process of integrating smart accounts in your applications, check out the section on [Smart Accounts](/smart-accounts/overview).

3. To explore more ways to use Account Kit, check out the many step-by-step guides, such as [How to Sponsor Gas for a User Operation](/guides/sponsoring-gas/sponsoring-gas) or [How to Fetch Smart Account Data](/guides/enhanced-apis/nft).

4. To see Account Kit in action, check out our [Demos](/overview/demos).
