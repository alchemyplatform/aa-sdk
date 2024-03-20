---
outline: deep
head:
  - - meta
    - property: og:title
      content: Setup
  - - meta
    - name: description
      content: Setup guide to build a custom account with aa-sdk.
  - - meta
    - property: og:description
      content: Setup guide to build a custom account with aa-sdk.
  - - meta
    - name: twitter:title
      content: Setup
  - - meta
    - name: twitter:description
      content: Setup guide to build a custom account with aa-sdk.
---

# Setup

This guide will show you how to setup a node.js project to build a custom account with the aa-sdk. You'll also learn how to get your Alchemy API key which is required to initiate any action with the custom account.

## 1. Create a new project

Navigate to the directory in your terminal where you want to create your new project and run the following commands:
::: code-group

```bash [npm]
mkdir custom-accounts
cd custom-accounts
npm init es6 -y
```

```bash [yarn]
mkdir custom-accounts
cd custom-accounts
yarn init -y
```

:::

This will initialize a new node.js project called `custom-accounts` with a `package.json` file.

## 2. Install the packages

Next, install the required packages by running the following commands in your project directory:
::: code-group

```bash [npm]
npm install -save-dev typescript
npm install @alchemy/aa-alchemy @alchemy/aa-core @alchemy/aa-accounts @alchemy/aa-signers viem
```

```bash [yarn]
yarn add -D typescript
yarn add @alchemy/aa-alchemy @alchemy/aa-core @alchemy/aa-accounts @alchemy/aa-signers viem
```

:::

This will install the following packages:

1. `@alchemy/aa-alchemy`: An aa-sdk package required when using Rundler (Alchemy's Bundler) or Gas Manager (Alchemy's Paymaster).
2. `@alchemy/aa-core`: An aa-sdk package that contains the core interfaces and components for interacting with the ERC-4337 infrastructure. Essential for interacting with smart accounts.
3. `viem`: A library that contains helpful abstractions and modules that are useful when using the aa-sdk. Additionally, many aa-sdk modules use `viem` themselves.
4. `typescript`: The TypeScript compiler. Required to compile the TS code that you'll write in subsequent guides.

## 3. Verify your node.js version

Make sure your `Node` version is _18.16.0_ using your version manager:

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

:::

## 4. Get your Alchemy API key

To create a custom account and send userops, you'll need an Alchemy API key. If you don't have one, you can sign up for a free account at [Alchemy](https://dashboard.alchemy.com/). Once you have an account, navigate to the [Apps](https://dashboard.alchemy.com/apps) section of your dashboard and create a new app called `custom accounts`. Make sure to select the "Ethereum Sepolia" network when creating the app.

<img src="/images/custom-accounts-app-creation.png" alt="Custom Accounts App Creation" style="display: block; margin: auto;">

Once the app is created, you'll be able to access your API key from the app's settings page.

<img src="/images/custom-accounts-sepolia-app.png" alt="Custom Accounts API Key" style="display: block; margin: auto;">

Save this API key as you'll need it later!

## 5. Create a .env file

To make things easier, create a `.env` file in the root of your project and add the following to it:

```env
ALCHEMY_API_KEY=<your-key-from-above>
# we'll use this key to generate an owner for our account later
PRIVATE_KEY=<a-private-key-for-testing>
```

## 6. Create the index.ts file

Finally, create a new file called `index.ts` in the root of your project. This is where you'll write the code for your custom account.

::: details Using `dotenv` to load environment variables
One way to leverage the `.env` file above is to use `dotenv` to load the environment variables into your project. Install
::: code-group

```bash [npm]
npm install dotenv
```

```bash [yarn]
yarn add dotenv
```

Then at the top of your `index.ts` file, add the following line:

::: code-group

```ts [index.ts]
import "dotenv/config";
```

:::

You're now ready to start building your custom account! 🚀
