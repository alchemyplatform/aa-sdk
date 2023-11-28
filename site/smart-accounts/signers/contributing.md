---
outline: deep
head:
  - - meta
    - property: og:title
      content: Contributing Your Signer
  - - meta
    - name: description
      content: Follow this guide to contribute a new Signer to Account Kit documentation, and enable developers to sign ERC-4337 transactions with your Signer.
  - - meta
    - property: og:description
      content: Follow this guide to contribute a new Signer to Account Kit documentation, and enable developers to sign ERC-4337 transactions with your Signer.
  - - meta
    - name: twitter:title
      content: Contributing Your Signer
  - - meta
    - name: twitter:description
      content: Follow this guide to contribute a new Signer to Account Kit documentation, and enable developers to sign ERC-4337 transactions with your Signer.
---

# Contributing Your Signer

If you'd like to add your Signer to this list, we welcome PRs! Here's how to do it:

1. Fork this [repo](https://github.com/alchemyplatform/aa-sdk)
2. In [`site/.vitepress/config.ts`](https://github.com/alchemyplatform/aa-sdk/blob/main/site/.vitepress/config.ts), there is a `sidebar` property. Find the `Choosing a Signer` item and add a new entry in `items`. The `text` property of the entry is what will be visible in the sidebar and the `link` property should be `kebab-case`. This should match the file name in the next step. Place it above the `Externally Owned Account` guide. eg:

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

3. Add your document to [`site/smart-accounts/signers/`](https://github.com/alchemyplatform/aa-sdk/tree/main/site/smart-accounts/signers) and name it `your-signer-name.md` (the name should match the `link` property you added in the previous step)
4. Open a PR!

If your `Signer` or library exports an `EIP-1193` compliant provider, you can use the `WalletClientSigner` from `aa-core` to easily integrate with Account Kit. See the ["Using Your Own Signer"](/smart-accounts/signers/custom-signer) guide for more details.
