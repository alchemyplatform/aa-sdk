---
outline: deep
head:
  - - meta
    - property: og:title
      content: Contributing to Signer Docs
  - - meta
    - name: description
      content: How to contribute a signer to the docs
  - - meta
    - property: og:description
      content: How to contribute a signer to the docs
---

# Adding Your Signer to This List

If you'd like to add your signer to this list, we welcome PRs! Here's how to do it:

1. Fork this [repo](https://github.com/OMGWINNING/aa-sdk-staging)
2. In [`site/.vitepress/config.ts`](https://github.com/OMGWINNING/aa-sdk-private/blob/main/site/.vitepress/config.ts), there is a `sidebar` property. Find the `Choosing a Signer` item and add a new entry in `items`. The `text` property of the entry is what will be visible in the sidebar and the `link` property should be `kebab-case`. This should match the file name in the next step. Place it above the `Externally Owned Account` guide. eg:

```ts{9}
{
  sidebar: [
    // ... other entries
    {
      text: "Choosing a Signer",
      base: "/smart-accounts/signers",
      items: [
        // ... other entries
        { text: "My New Signer", link: "/my-new-signer" },
        { text: "Externally Owned Account", link: "/eoa" },
        { text: "Using Your Own", link: "/using-your-own" },
        { text: "Contributing", link: "/contributing" },
      ],
    },
  ];
}
```

3. Add your document to [`site/smart-accounts/signers/`](https://github.com/OMGWINNING/aa-sdk-staging/tree/main/site/smart-accounts/signers) and name it `your-signer-name.md` (the name should match the `link` property you added in the previous step)
4. Open a PR!

If your `Signer` or library exports an `EIP-1193` compliant provider, you can use the `WalletClientSigner` from `aa-core` to easily integrate with Account Kit. See the ["Using Your Own Signer"](/smart-accounts/signers/using-your-own) guide for more details.
