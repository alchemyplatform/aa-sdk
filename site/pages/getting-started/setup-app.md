---
outline: deep
title: Getting started guide
description: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Account, Rundler and Gas Manager.
---

# Setup your application

This section will walk you through the steps to create your application, install the necessary dependencies, and write the boilerplate code you'll need to integrate Embedded Accounts!

## Create your app

First, create a [NextJS React application](https://nextjs.org/docs/pages/api-reference/create-next-app) by running `npx create-next-app` from your terminal in a project directory of your choice. Select the default configuration for each question the `create-next-app` CLI.

Also, at the root of this new application directory, add a `.env` file.

## Configure the Embedded Accounts

First, create an Alchemy API key, an Embedded Accounts Config, and a Gas Manager Policy. You will use these to send UOs, authenticate logins, and sponsor gas respectively.

### Alchemy API Key

The Alchemy API Key will allow you to read and write to blockchains through Alchemy's reliable infrastructure. In this context, the API Key will let you create Embedded Accounts onchain for your users, and send UserOperations on behalf of those accounts.

To create an API Key, go to https://dashboard.alchemy.com, sign up for an account, and go through the onboarding. Then on the [apps](https://dashboard.alchemy.com/apps/?a=embedded-accounts-get-started) page, click "Create new app" button.

![API Key Create](/images/getting-started/api-key-create.png)

When configuring the Alchemy app, select Arbitrum Sepolia for the network.

![API Key Configure](/images/getting-started/api-key-configure.png)

Click the API Key button in the top right corner and copy-paste it into the `.env` file of your application as an environment variable called `ALCHEMY_API_KEY`.

![API Key View](/images/getting-started/api-key-view.png)

### Alchemy Embedded Accounts Config

The Embedded Accounts Config enables [magic link authentication](https://accountkit.alchemy.com/resources/terms#magic-link-authentication) on your app's domain by configuring the Alchemy Signer, which securely stores the user's private key in a non-custodial [secure enclave](https://docs.turnkey.com/security/our-approach). It is responsible for authenticating a user via email or passkey using this config, managing a user's session, and signing messages to send UserOperations. Check out the [AlchemySigner docs](https://accountkit.alchemy.com/packages/aa-alchemy/signer/overview) for more details.

To create an Embedded Accounts Config, go to the [embedded accounts page](https://dashboard.alchemy.com/accounts/?a=embedded-accounts-get-started) of the Alchemy dashboard and click the “New account config” button.

![Accounts Config Create](/images/getting-started/accounts-config-create.png)

Then:

1. Name your config.
2. Set `http://localhost:3000` as the redirect URL. NextJS apps by default are hosted locally at port 3000, and you will want to direct the user back to the URL where your application is hosted to authenticate them.
3. [optional] Customize the logo, “Sign In” button color, and support URL of the email.

![Accounts Config Configure 1](/images/getting-started/accounts-config-configure-1.png)

Next, apply this config to the Alchemy App you created in the previous step. Doing this will allow you send requests to Alchemy Signer via the Account Kit SDKs you will install in the next step.

![Accounts Config Configure 2](/images/getting-started/accounts-config-configure-2.png)

### Alchemy Gas Manager Policy

The Gas Manager Policy defines a config for Alchemy's ERC-4337 Paymaster implementation, allowing you to sponsor your users' gas fees. To learn more about Paymasters, check out Alchemy's [blog post](https://www.alchemy.com/overviews/what-is-a-paymaster).

To create a Gas Manager Policy, go to the [gas manager](https://dashboard.alchemy.com/gas-manager?a=embedded-accounts-get-started) page of the Alchemy dashboard and click the “Create new policy” button.

![Gas Manager Create](/images/getting-started/gas-manager-create.png)

Then:

1. Name your policy.
2. Associate the policy with the Alchemy App you created in the last step by selecting it in the “Policy details” section.
3. Select the default configurations for the remaining sections.

![Gas Manager Configure](/images/getting-started/gas-manager-configure.png)

Once you create the policy, copy the Policy ID below the policy's header and copy-paste it into the .env file of your application as an environment variable called `NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID`.

## Install dependencies

In this newly created directory for your app, add the following dependencies:

:::code-group

```bash [npm]
npm i @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem@2.8.6 @tanstack/react-query@5.28.9
```

```bash [yarn]
yarn add @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem@2.8.6 @tanstack/react-query@5.28.9
```

```bash [pnpm]
pnpm i @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem@2.8.6 @tanstack/react-query@5.28.9
```

:::

:::warning
The versions of `viem` and `@tanstack/react-query` that's required to be installed is listed as a `peerDependency` of the various `@alchemy/*` packages (`2.8.6` and `5.28.9`, respectively, at the time of writing). Due to some breaking changes between patch and minor versions of `viem` and `@tanstack/react-query`, it's recommended to pin your version of `viem` to the listed `peerDependency` in the `package.json`.
:::

The three Alchemy packages - `@alchemy/aa-alchemy`, `@alchemy/aa-accounts`, and `@alchemy/aa-core` - come from the [Alchemy Account Kit](https://accountkit.alchemy.com/), and will provide the key building blocks for created Embedded Accounts.

[`viem`](https://viem.sh/) is a useful Web3 Utils library and a key dependency of Account Kit.

[`@tanstack/react-query`](https://tanstack.com/query/latest) is a popular library for managing client-side state in NextJS and React applications. You're welcome to use another state management library or vanilla react, but the rest of this demo will use ReactQuery.

## Set up your backend

Using your code editor, open your newly created application directory to add the backend! Your application's backend will serve as an API that your frontend will use to send requests to Alchemy's infrastructure to sign messages, send UserOperations, and track your users' Embedded Account activity.

From the root of NextJS project's directory, using the NextJS concept of [route handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers), create new directory `src/app/api/rpc` and add two files: `src/app/api/rpc/[...routes]/route.ts` to handle calls to the Alchemy Signer, and `src/app/api/rpc/route.ts` to handle requests to Alchemy's infrastructure. Copy the following into those files.

:::code-group

```ts [src/app/api/rpc/route.ts]
// [!include ~/snippets/getting-started/setup-app/route.ts]
```

```ts [src/app/api/rpc/[...routes]/route.ts]
// [!include ~/snippets/getting-started/setup-app/routes.ts]
```

:::

Notice that here, you'll be using the `ALCHEMY_API_KEY` environment variable you set in an earlier step. Also note that the backend routes will make requests to Alchemy's infrastructure for the Arbitrum Sepolia network.

## Set up your frontend

Before building your app's UI, you'll want to configure a [NextJS router](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating) and [a ReactQuery client](https://tanstack.com/query/v4/docs/framework/react/reference/QueryClientProvider) to manage state around requests the app will make, and wrap components that use. From the root of NextJS project's directory, create a file `src/app/providers.tsx` and initialize these providers.

Then, in the `src/app/layout.tsx` file that came with the NextJS boilerplate, wrap the `children` component in the `Providers` component you just created in `src/app/providers.tsx`.

These two files should look as follows:

:::code-group

```tsx [src/app/layout.tsx]
// [!include ~/snippets/getting-started/setup-app/layout.tsx]
```

```tsx [src/app/providers.tsx]
// [!include ~/snippets/getting-started/setup-app/providers.tsx]
```

```ts [src/app/config.ts]
// [!include ~/snippets/getting-started/setup-app/config.ts]
```

:::

Now, you have all the pieces in place to build a new web application using Embedded Accounts! In the next step of this guide, you'll integrate the Alchemy Signer to enable your app to sign users into their newly created Embedded Accounts.
