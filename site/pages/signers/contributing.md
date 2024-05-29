---
outline: deep
title: Contributing Your Signer
description: Follow this guide to contribute a new Signer to Account Kit documentation, and enable developers to sign ERC-4337 transactions with your Signer.
---

# Contribute your Signer

If you would like to add your Signer to Account Kit, we welcome PRs! You will need to fork the [`aa-sdk` Github repo](https://github.com/alchemyplatform/aa-sdk) and then follow the below steps.

## 1. Add your Signer to [`aa-signers`](https://github.com/alchemyplatform/aa-sdk/tree/main/packages/signers)

To ensure the best developer experience for anyone using Account Kit, we ask that you add your Signer implementation to our [`aa-signers`](https://github.com/alchemyplatform/aa-sdk/tree/main/packages/signers) SDK package.

There, you will be able to implement [`SmartAccountAuthenticator`](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/signer/types.ts#L15) interface from `aa-core` which offers a wrapper for any SDKs, `inner`, that you may use to call upon for implementation details. You may also wish to build your Signer implementation from scratch.

In either case, if your `Signer` or library exports an `EIP-1193` compliant provider, you may find it helpful to use [`WalletClientSigner`](/packages/aa-core/signers/wallet-client) from `aa-core` to easily integrate your Signer in `aa-signers`. See the ["Using your own Signer"](/signers/guides/custom-signer) guide for more details.

Make sure to include unit tests along with your implementation! Take a look at these PRs from [Magic](https://github.com/alchemyplatform/aa-sdk/pull/229) and [Web3Auth](https://github.com/alchemyplatform/aa-sdk/pull/247) for reference.

:::tip
If you your Signer implementation requires adding SDKs as dependencies, you should list them as `optionalDependencies`. Additionaly, `aa-signers` expects those SDKs to be node.js Javascript SDKs to so that all developers can use Account Kit with your Signer.

If your SDK is based on a frontend Javascript framework, such as React.js or Vue.js, you will just have to follow step 2 onwards to submit documentation with an example snippet clarifying that your Signer must be used in said framework.
:::

## 2. Add documentation about your Signer

You will want to add documentation about your Signers so that developers can easily use your implementation in Account Kit. Below, we recommend adding documentation about your Signer's APIs, as well.

To ensure these docs are visible on the Account Kit docs, you will want to add links to them in the [`site/.vitepress/sidebar/packages/aa-signers.ts`](https://github.com/alchemyplatform/aa-sdk/blob/main/site/.vitepress/sidebar/packages/aa-signers.ts) file in the `aa-sdk` repo, where there is a `aaSignersSidebar` configuration.

### 2.1 Add API documentation

If your Signer implements the `SmartAccountAuthenticator` interface, you will have at least 5 methods to document: `getAddress`, `authenticate`, `signMessage`, `signTypedData`, and `getAuthDetails`. You can also add additional methods to your implementation. Just make sure to add documentation!

Note that the `text` property of the entry is what will be visible in the sidebar and the `link` property should be `kebab-case`:

```ts
export const aaSignersSidebar: DefaultTheme.SidebarItem = {
  text: "aa-signers",
  collapsed: true,
  base: "/packages/aa-signers",
  items: [
    {
      text: "Getting started",
      link: "/",
    },
    // ... other signers
    {
      text: "Your Signer Name",
      collapsed: true,
      base: "/packages/aa-signers/<your_signer>",
      items: [
        { text: "Introduction", link: "/introduction" },
        { text: "constructor", link: "/constructor" },
        { text: "authenticate", link: "/authenticate" },
        { text: "getAddress", link: "/getAddress" },
        { text: "signMessage", link: "/signMessage" },
        { text: "signTypedData", link: "/signTypedData" },
        { text: "getAuthDetails", link: "/getAuthDetails" },
      ],
    },
    { text: "Contributing", link: "/contributing" },
  ],
};
```

In that section, add documentation introducing the value prop of your Signer, how to initialize the Signer object, and how to call each method. The example above shows the items you will need to include if you chose to have your Signer implement the `SmartAccountAuthenticator` interface.

### 2.2 Add an integration guide

You will want to add an integration guide that walks through step-by-step how to use your Signer implementation in `aa-signers` with the other building blocks, namely smart accounts and provider clients.

Find the `Choosing a Signer` item in the `sidebar` and add a new entry in `items`. The `text` property of the entry is what will be visible in the sidebar and the `link` property should be `kebab-case`. Place it above the `Externally Owned Account` guide:

```ts
{
  sidebar: [
    // ... other entries
    {
      text: "Choosing a Signer",
      base: "/signers",
      items: [
        { text: "Introduction", link: "/choosing-a-signer" },
        {
          text: "Signer Guides",
          base: "/signers/guides",
          collapsed: true,
          items: [
            // ... other signers
            { text: "Your Signer", link: "/your-signer-name" },
            { text: "Externally Owned Account (EOA)", link: "/eoa" },
            { text: "Using your own", link: "/custom-signer" },
          ],
        },
        { text: "Contributing Your Signer", link: "/contributing" },
      ],
    },
  ];
}
```

In that linked file `your-signer-name` under Signer Guides, add your step-by-step integration. Try to include an example snippet when possible.

Again, for reference, take a look at these PRs from [Magic](https://github.com/alchemyplatform/aa-sdk/pull/229) and [Web3Auth](https://github.com/alchemyplatform/aa-sdk/pull/247).

## 3. Submit a pull request

You can open a PR to merge the branch with your Signer implementation from your forked repo into the `main` branch of the `aa-sdk` repo. We will make sure to review it promptly, provider feedback, and merge the PR when ready so that developers can use your Signer!
