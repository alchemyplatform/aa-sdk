---
outline: deep
head:
  - - meta
    - property: og:title
      content: Getting started guide
  - - meta
    - name: description
      content: Learn how to get started with Alchemy's Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Learn how to get started with Alchemy's Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: Getting started guide
  - - meta
    - name: twitter:description
      content: Learn how to get started with Alchemy's Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Quick start

This guide will help you get started with Account Kit by setting up your environment, creating a smart account, and sending a User Operation (UO). By the end of this guide, you will have a basic understanding of how to use the SDK and where to look for more advanced use cases.

## 1. Install the packages

Run the following command in your project directory to install the required packages:

::: code-group

```bash [npm]
npm init es6 -y
npm install -save-dev typescript
npm install @alchemy/aa-alchemy @alchemy/aa-core @alchemy/aa-accounts @alchemy/aa-signers viem
```

```bash [yarn]
yarn init -y
yarn add -D typescript
yarn add @alchemy/aa-alchemy @alchemy/aa-core @alchemy/aa-accounts @alchemy/aa-signers viem
```

::: tip Note

Next, install [viem](https://viem.sh/) by running the below command. Viem contains helpful abstractions and modules that are useful when using Account Kit. Additionally, many Account Kit modules use `viem` themselves.

:::

Make sure your new `package.json` file looks similar to the one below. Note that we have `"type": module` in `package.json` for this example:

```json [package.json]
{
  "name": "account-kit-test",
  "version": "1.0.0",
  "description": "An Example Using Account Kit",
  "main": "index.ts",
  "type": "module",
  "license": "ISC",
  "devDependencies": {
    "typescript": "^5.2.2"
  },
  "dependencies": {
    "@alchemy/aa-accounts": "^*", // latest version
    "@alchemy/aa-alchemy": "^*", // latest version
    "@alchemy/aa-core": "^*", // latest version
    "viem": "^1.21.4" // latest version compatible with aa-sdk
  }
}
```

Also make sure your `Node` version is _18.16.0_ using your version manager:

::: code-group

```bash [nvm]
nvm install 18.16.0
nvm use 18.16.0
```

```bash [asdf]
asdf install nodejs 18.16.0
asdf global nodejs 18.16.0
asdf reshim nodejs
```

Lastly, create a file called `index.ts` in the project to write the code you will see below!

:::

## 2. Get your Alchemy API Key

To read or write any data to a blockchain, you will need an Alchemy API Key and RPC URL. Go to the [Alchemy Dashboard](https://dashboard.alchemy.com/signup/?a=aa-docs) and access your credentials from the dashboard.

<img src="/images/alchemy-dashboard.png" width="auto" height="auto" alt="Account Kit Overview" style="display: block; margin: auto;">

## 3. Query your Smart Account Address

::: tip
Don't use the example below with a hardcoded private key in production. Follow the [Alchemy Signer guide](/signers/alchemy-signer) to build a secure user friendly Embedded Account!
:::

Using the SDK in the following example, we will use Account Kit to generate the address of your smart account from which to send a UO eventually.

<<< @/snippets/getting-started/client.ts

Copy the above into `index.ts`. To run the script, do the following:

```bash
npx tsx index.ts
```

You will get a response like this in your terminal:

```
Smart Account Address: 0xYOUR_SMART_ACCOUNT_ADDRESS
```

## 4. Fund your Smart Account

At scale, you can use our Gas Manager to [sponsor User Operations](/using-smart-accounts/sponsoring-gas/gas-manager) for smart accounts so the user doesn't need to fund their account.

But for this quickstart guide, and because we are developing on a testnet, let's fund the account using the [Alchemy Faucet](https://sepoliafaucet.com). Simply log in with Alchemy and claim your testnet tokens for free.

<img src="/images/alchemy-faucet.png" width="auto" height="auto" alt="Account Kit Overview" style="display: block; margin: auto;">

## 5. Send a User Operation using Account Kit

Finally, deploy the newly funded smart account and send a UO on its behalf.

<<< @/snippets/getting-started/send-user-operation.ts

Copy the above to replace what's in `index.ts`. To run the full example script above, do:

```bash
npx tsx index.ts
```

And that's it! You should see the following on your terminal:

```
Smart Account Address: 0xYOUR_SMART_ACCOUNT_ADDRESS
UserOperation Hash: 0xYOUR_UO_HASH
Transaction Hash: 0xYOUR_TXN_HASH
```

:::tip Note
The UO hash is what our [Bundler](https://github.com/alchemyplatform/rundler) returns once it submits the UO to the Blockchain on behalf of your smart account.
You will want to use the `Transaction Hash` to know when the UO is mined on a blockchain to query information about it.
:::

:::tip Handling Errors
When running the above script, you might see the following errors:

1. "precheck failed: maxFeePerGas is XXX but must be at least XXX, which is based on the current block base fee."
2. "precheck failed: sender balance and deposit together is XXX but must be at least XXX to pay for this operation."
3. "Failed to find transaction for User Operation."

These are due to increased network activity at that time and are fleeting issues. Running the script again will resolve them naturally.
:::

Since this "Getting started" example is a simple script, you must consider how Account Kit can work in various applications. Check out our [Demos](/overview/demos) to see how.

## 6. Use Alchemy Signer

In this example, we used a Local Signer. As the next step to a production ready app, follow this [Alchemy Signer guide](/signers/alchemy-signer) to build an Embedded Account with email, passkey (i.e. biometrics), and soon social auth flows!

## Dive deeper

In this guide, we initialized an `AlchemySmartAccountClient` with the `aa-alchemy` package to send a UO. However, you can do much more with Account Kit and its many packages.

1. To learn more about the different packages and their use cases, check out the [Packages overview](/packages/) page.

2. To learn about the end-to-end process of integrating smart accounts in your applications, check out the section on [Smart Accounts](/smart-accounts/).

3. To learn about the `signer` field on your smart account, check out the section on [Choosing a Signer](/signers/choosing-a-signer) to own the smart account.

4. To learn more about different User Operations, you can send with different `target` and `data` fields in the `sendUserOperation` function above, look at our [How to send a User Operation](/using-smart-accounts/send-user-operations) guide for an example using NFT mints.

5. To explore more ways to use Account Kit, check out the step-by-step guides, such as [How to sponsor gas for a UserOperation](/using-smart-accounts/sponsoring-gas/gas-manager) or [How to fetch a Smart Account's NFTs](/using-smart-accounts/enhanced-apis/nft).

6. To see Account Kit in action, check out our [Demos](/overview/demos).
