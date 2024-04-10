---
outline: deep
head:
  - - meta
    - property: og:title
      content: React Hooks Overview
  - - meta
    - name: description
      content: An overview of using React Hooks exported by Account Kit
  - - meta
    - property: og:description
      content: An overview of using React Hooks exported by Account Kit
  - - meta
    - name: twitter:title
      content: React Hooks Overview
  - - meta
    - name: twitter:description
      content: An overview of using React Hooks exported by Account Kit
---

# React Hooks Overview

If you are using Alchemy's RPC and Smart Contract Accounts and building a React application, you can use the React Hooks exported by Account Kit to interact with your Smart Contract Accounts. You're not required to use these hooks to leverage all of the power of Account Kit. The hooks are exported from `@alchemy/aa-alchemy` and can be found within the `@alchemy/aa-alchemy/react` namespace.

::: warning
React hooks are still being developed and the interfaces could change in the future!
:::

## Install the package

To use the React Hooks, you need to install the `@alchemy/aa-alchemy` and `@tanstack/react-query` packages. We use [`react-query`](https://tanstack.com/query/latest/docs/framework/react/overview) to manage async data fetching and mutations in our hooks.

::: code-group

```bash[npm]
npm install @alchemy/aa-alchemy @tanstack/react-query
```

```bash[yarn]
yarn add @alchemy/aa-alchemy @tanstack/react-query
```

```bash[pnpm]
pnpm add @alchemy/aa-alchemy @tanstack/react-query
```

:::

## Create a config

In order to get started, you'll first have to define a config object that can be used to create an `AlchemyAccountContext` that will be used by all of the hooks exported by the library.

::: code-group
<<< @/snippets/react/config.ts
:::

## Wrap app in Context Provider

Next, you'll need to add the `AlchemyAccountProvider` to your application and pass in the config object and an instance of the `react-query` `QueryClient`.

::: code-group

<<< @/snippets/react/app.tsx

<<< @/snippets/react/config.ts
:::

## Use the hooks

Explore the remaining hooks docs and use them in your application!
