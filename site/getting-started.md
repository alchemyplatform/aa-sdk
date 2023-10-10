---
outline: deep
head:
  - - meta
    - property: og:title
      content: Getting Started
  - - meta
    - name: description
      content: Getting Started with Alchemy's Account Kit
  - - meta
    - property: og:description
      content: Getting Started with Alchemy's Account Kit
---

# Getting Started

This guide will help you get started with Account Kit by setting up your environment, creating a Light Account (a type of smart account implementation), and sending a User Operation from it. By the end of this guide, you'll have a basic understanding of how to use the SDK and where to look for more advanced use cases.

## Install the Packages

First, create an empty directory and initialize it:
::: code-group

```bash [npm]
mkdir account-kit
cd account-kit
npm init -y
```

```bash [yarn]
mkdir account-kit
cd account-kit
yarn init -y
```

:::

Then you'll need to install the required packages:

::: code-group

```bash [npm]
npm install @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem
```

```bash [yarn]
yarn add @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem
```

:::

## A Simple Light Account Example

Using the SDK, we'll create a Light Account and send a User Operation from it. The Light Account will be owned by an Externally Owned Account (EOA). Here's a demonstration:

<<< @/snippets/light-account.ts

This initializes a `provider` for your smart account which is then used to send user operations from it.

::: tip Note
Remember to:

1. Replace `"0xYourEOAPrivateKey"` with your actual EOA private key.
2. Set `"ALCHEMY_API_KEY"` with your unique Alchemy API key.
3. Fund your smart account address with some SepoliaETH in order for the user operation to go through. This address is logged to the console when you run the script.
4. Adjust the `target` and `data` fields in the `sendUserOperation` function to match your requirements.
   :::

## Dive Deeper

In this guide we initialized `provider` with the `aa-alchemy` package however we could have done the same with the other packages of Account Kit as well. To learn more about the different packages and their use cases, check out the ["Packages Overview"](/package-overview) page.

## Next Steps

To learn about the end-to-end process of integrating smart accounts in your applications check out the section on [using smart accounts](/smart-accounts/overview.html)
