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

This guide will help you get started with Account Kit by setting up your environment, creating a smart account, and sending a `UserOperation` (UO) on its behalf. By the end of this guide, you'll have a basic understanding of how to use the SDK and where to look for more advanced use cases.

## 1. Install the Packages

In your project directory, you'll need to run the following to install the required packages:

::: code-group

```bash [npm]
npm init es6 -y
npm install -save-dev typescript
npm install @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem
```

```bash [yarn]
yarn init -y
yarn add -D typescript
yarn add @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem
```

::: tip Note

We're installing [viem](https://viem.sh/) as well. Viem contains helpful abstractions and modules that will come in handy when using Account Kit. Additionally, many Account Kit modules use `viem` themselves.

:::

Make sure your new `package.json` file looks something like the following. Note that we have `"type": module` in `package.json` for this example:

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
    "@alchemy/aa-accounts": "^1.1.0",
    "@alchemy/aa-alchemy": "^1.1.0",
    "@alchemy/aa-core": "^1.1.0",
    "viem": "^1.19.3"
  }
}
```

You'll also want to make sure your `Node` version is _18.16.0_ using your version manager:

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

Lastly, create a file called `index.ts` in the project to write the code you'll see below!

:::

## 2. Get Your Alchemy API Key

To read or write any data to a blockchain, you'll need an Alchemy API Key and RPC URL. Go to the [Alchemy Dashboard](https://dashboard.alchemy.com) and access your credentials from the button shown below.

<img src="/images/alchemy-dashboard.png" width="auto" height="auto" alt="Account Kit Overview" style="display: block; margin: auto;">

## 2. Query Your Smart Account Address

Using the SDK in the following example, we'll use the Account Kit to generate the address of your smart account from which to eventually send a UO.

<<< @/snippets/getting-started/provider.ts

Copy the above into `index.ts`. To run the script, do:

```bash
npx tsx index.ts
```

You'll get a response like this on your terminal:

```
Smart Account Address: 0xYOUR_SMART_ACCOUNT_ADDRESS
```

## 3. Fund Your Smart Account

To deploy the smart account and send UOs on its behalf, you'll need to add native token to your smart account.

At scale, you might consider using our Gas Manager to [sponsor UserOperations](/guides/sponsoring-gas/sponsoring-gas) for smart accounts. But for the purpose of this example, and because we're using a testnet, let's fund the account using the [Alchemy Faucet](https://sepoliafaucet.com). Make sure to log in with Alchemy to receive your testnet tokens.

<img src="/images/alchemy-faucet.png" width="auto" height="auto" alt="Account Kit Overview" style="display: block; margin: auto;">

## 4. Send a User Operation Using Account Kit

Finally, let's deploy the newly funded smart account and send a UO on its behalf.

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

To know when the UO is mined on a blockchain in order query information about it, you'll want to use the `Transaction Hash`.
:::

:::tip Handling Errors
When running the above script, you might see the following errors:

1. "precheck failed: maxFeePerGas is XXX but must be at least XXX, which is based on the current block base fee"
2. "Failed to find transaction for User Operation"

These are due to increase network activity at that time, and are fleeting issues. Running the script again will resolve them naturally.
:::

Since this "Getting Started" example is a simple script, you'll need to consider how Account Kit can work in various applications. Check out our [Demos](/overview/demos) to see how.

## 5. Dive Deeper

In this guide, we initialized an `AlchemyProvider` with the `aa-alchemy` package to send a UO. However, you can do a lot more with Account Kit and its many packages.

1. To learn more about the different packages and their use cases, check out the ["Packages Overview"](/overview/package-overview) page.

2. To learn about the end-to-end process of integrating smart accounts in your applications, check out the section on [Smart Accounts](/smart-accounts/overview).

3. To learn about the `owner` field on your smart account, check out the section on [Choosing a Signer](/smart-accounts/signers/choosing-a-signer) to own the smart account.

4. To learn more about different User Operations you can send with different `target` and `data` fields in the `sendUserOperation` function above, look at our [How to Send a User Operation](/guides/send-user-operation) guide for an example using NFT mints.

5. To explore more ways to use Account Kit, check out the many step-by-step guides, such as [How to Sponsor Gas for a User Operation](/guides/sponsoring-gas/sponsoring-gas) or [How to Fetch Smart Account Data](/guides/enhanced-apis/nft).

6. To see Account Kit in action, check out our [Demos](/overview/demos).
