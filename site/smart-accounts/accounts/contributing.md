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

If you'd like to add your smart account implementation to this list, we welcome PRs! Here's how to do it:

1. Fork this [repo](https://github.com/alchemyplatform/aa-sdk)
2. In [`site/.vitepress/config.ts`](https://github.com/alchemyplatform/aa-sdk/blob/main/site/.vitepress/config.ts), there is a `sidebar` property. Find the `Choosing an Account` item and add a new entry in `items`. The `text` property of the entry is what will be visible in the sidebar and the `link` property should be `kebab-case`. This should match the file name in the next step. For instance:

```ts
{
  sidebar: [
    // ... other entries
    {
      text: "Choosing an Account Guides",
      base: "/smart-accounts/accounts",
      items: [
        { text: "Introduction", link: "/choosing-a-smart-account" },
        {
          text: "Smart Account Guides",
          base: "/smart-accounts/accounts/guides",
          collapsed: true,
          items: [
            // ... other entries
            { text: "My New Account", link: "/your-account-name" },
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

3. Add your document to [`site/smart-accounts/accounts/`](https://github.com/alchemyplatform/aa-sdk/tree/main/site/smart-accounts/accounts) and name it `your-account-name.md` (the name should match the `link` property you added in the previous step)
4. Open a PR!
