---
outline: deep
head:
  - - meta
    - property: og:title
      content: Getting started guide
  - - meta
    - name: description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Account, Rundler and Gas Manager.
  - - meta
    - property: og:description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Account, Rundler and Gas Manager.
  - - meta
    - name: twitter:title
      content: Getting started guide
  - - meta
    - name: twitter:description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Account, Rundler and Gas Manager.
---

# Quick start

---

<img src="/images/getting-started/embedded-accounts-banner.png" alt="Embedded Accounts Banner" />

## Try out the User Experience

You can build awesome web3 user experiences with embedded accounts. Want to try it out as a user? Check out this [ERC20 Token Minter](https://smart-accounts-token-demo.vercel.app/).

In this app each user is provided a smart account tied to their email address. Every onchain action is gas-sponsored so the user can start minting and transferring tokens at the click of a button!

::: tip Want to see how it was built?
Here is a [YouTube video](https://www.youtube.com/watch?v=OYmehd482fA) which shows the process of building this application.
:::

## Starter app

If you want the most basic application, check out our [starter app repository](https://github.com/alchemyplatform/embedded-accounts-quickstart) provides just that. It is a react app built with NextJS and tailwind CSS, to create this experience:

<VideoEmbed src="/videos/embedded-accounts-full.mp4" />

To get started, simply [clone the repository](https://github.com/alchemyplatform/embedded-accounts-quickstart) and follow the [app configuration](../getting-started/app-configuration.md).

::: tip Curious how this integrates with Account Kit?
Check out the [starter app guide](./starter-guide) to see all the key points of integration for this starter app.
:::

## Scaffold-AA

If you need a fully featured tool for building an application like the one you saw above, you can do so with [scaffold-aa](https://github.com/alchemyplatform/scaffold-aa).

This tool is a fork of the popular [Scaffold-ETH 2](https://scaffoldeth.io). You'll be able to use all the [scaffold-eth react components and hooks](https://docs.scaffoldeth.io/) to easily tie your app together with the smart contracts you're interacting with.

To get started, simply [clone the repository](https://github.com/alchemyplatform/scaffold-aa) and follow the [app configuration](../getting-started/app-configuration.md).

## Want to learn more?

If you're interested in how the starter app integrates with the account kit, check out the [starter app guide](./starter-guide) next.
