---
outline: deep
head:
  - - meta
    - property: og:title
      content: How to Use Your Own Account Signer
  - - meta
    - name: description
      content: Follow this guide to use any Signer you want with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this guide to use any Signer you want with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: How to Use Your Own Account Signer
  - - meta
    - name: twitter:description
      content: Follow this guide to use any Signer you want with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# How to Use Your Own Account Signer

Account Kit is designed to be flexible and allow you to use any Signer you want. You have two options. You can either:

1. If your Signer is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant provider, you can leverage `viem`'s `WalletClient` and the `WalletClientSigner` exported in `aa-core`
2. Implement `SmartAccountSigner` (exported in `aa-core`)

## Using `WalletClientSigner`

Viem allows you to create `WalletClient`s which can be used to wrap local or JSON RPC based wallets. You can see the complete docs for leveraging the `WalletClient` [here](https://viem.sh/docs/clients/wallet.html).

We support a `SmartAccountSigner` implementation called `WalletClientSigner` that makes it really easy to use a viem `WalletClient` as an owner on your Smart Contract Account. If your Signer is EIP-1193 compliant, it's really easy to use with `WalletClient`. Let's take a look at a simple example:

<<< @/snippets/wallet-client-signer.ts

## Implementing `SmartAccountSigner`

The `SmartAccountSigner` interface is really straighforward:

<<< @/../packages/core/src/signer/types.ts

## Adding Your Signer to This List

If you'd like to add your Signer to this list, we welcome PRs! Here's how to do it:

1. Fork this [repo](https://github.com/alchemyplatform/aa-sdk)
2. In [`site/.vitepress/config.ts`](https://github.com/alchemyplatform/aa-sdk/blob/main/site/.vitepress/config.ts), there is a `sidebar` property. Find the `Choosing a Signer` item and add a new entry in `items`. The `text` property of the entry is what will be visible in the sidebar and the `link` property should be `kebab-case`. This should match the file name in the next step. Place it above the `Externally Owned Account` guide and maintain alphabetical order. eg:

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
