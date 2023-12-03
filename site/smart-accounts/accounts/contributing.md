---
outline: deep
head:
  - - meta
    - property: og:title
      content: Contributing Your Account
  - - meta
    - name: description
      content: Follow this guide to contribute a new smart account to Account Kit documentation.
  - - meta
    - property: og:description
      content: Follow this guide to contribute a new smart account to Account Kit documentation.
  - - meta
    - name: twitter:title
      content: Contributing Your Account
  - - meta
    - name: twitter:description
      content: Follow this guide to contribute a new smart account to Account Kit documentation.
---

# Contributing Your Account

If you'd like to add your smart account to Account Kit, we welcome PRs! You'll need to fork the [`aa-sdk` Github repo](https://github.com/alchemyplatform/aa-sdk) and then follow the below steps.

## 1. Add Your Smart Account to [`aa-accounts`](https://github.com/alchemyplatform/aa-sdk/tree/main/packages/accounts)

To ensure the best developer experience for anyone using Account Kit, we ask that you add your smart account implementation to our [`aa-accounts`](https://github.com/alchemyplatform/aa-sdk/tree/main/packages/accounts) SDK package.

There, you'll want to add an implemention of the [`ISmartContractAccount`](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/account/types.ts#L23) interface from `aa-core`. Make sure to include unit tests along with your implementation!

## 2. Add Documentation about Your Smart Account

You'll want to add documentation about your smart account so that developers can easily use your implementation in Account Kit. Below, we recommend adding documentation about your smart account's APIs, as well.

To ensure these docs are visible on the Account Kit docs, you'll want to add links to them in the [`site/.vitepress/config.ts`](https://github.com/alchemyplatform/aa-sdk/blob/main/site/.vitepress/config.ts) file in the `aa-sdk` repo, where there is a `sidebar` property in the object.

### 2.1 Adding API Documentation

If your smart account implements the `SmartAccountAuthenticator` interface, you'll have at least 5 methods to document: `getAddress`, `authenticate`, `signMessage`, `signTypedData`, and `getAuthDetails`. You can also add additional methods to your implementation. Just make sure to add documentation!

Find the `aa-accounts` item in the `sidebar` and add a new entry in `items`. The `text` property of the entry is what will be visible in the sidebar and the `link` property should be `kebab-case`:

```ts
{
  sidebar: [
    // ... other packages
    {
      text: "aa-accounts",
      collapsed: true,
      base: "/packages/aa-accounts",
      items: [
        // ... other entries
        {
          text: "Your Account",
          collapsed: true,
          base: "/packages/aa-accounts/your-account-name",
          items: [
            // ... all methods on the smart account implementation
          ],
        },
        // ... other smart accounts and more
        { text: "Contributing", link: "/contributing" },
      ],
    },
  ];
}
```

In that section, add documentation introducing the value prop of your smart account, how to initialize the smart account object, and how to call each method. The example above shows the items you'll need to include if you chose to have your smart account implement the `SmartAccountAuthenticator` interface.

### 2.2 Adding an integration guide

You'll want to add an integration guide that walks through step-by-step how to use your smart account implementation in `aa-accounts` with the other building blocks, namely provider clients.

Find the `Choosing a Smart Account` item in the `sidebar` and add a new entry in `items`. The `text` property of the entry is what will be visible in the sidebar and the `link` property should be `kebab-case`:

```ts
{
  sidebar: [
    // ... other entries
    {
      text: "Choosing a Smart Account",
      base: "/smart-accounts/accounts",
      items: [
        { text: "Introduction", link: "/choosing-a-smart-account" },
        {
          text: "Smart Account Guides",
          base: "/smart-accounts/accounts/guides",
          collapsed: true,
          items: [
            // ... other smart accounts
            { text: "Your Account", link: "/your-account-name" },
            { text: "Light Account", link: "/light-account" },
            { text: "Modular Account", link: "/modular-account" },
            { text: "Using Your Own", link: "/using-your-own" },
          ],
        },
        { text: "Deployments", link: "/deployment-addresses" },
        { text: "Contributing Your Account", link: "/contributing" },
      ],
    },
  ];
}
```

In that linked file `your-account-name` under Smart Account Guides, add your step-by-step integration. Try to include an example snippet when possible.

## 3. Submit a Pull Request

You can open a PR to merge the branch with your smart account implementation from your forked repo into the `main` branch of the `aa-sdk` repo. We'll make sure to review it promptly, provider feedback, and merge the PR when ready so that developers can use your smart account!
