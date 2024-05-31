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

This guide will show you how to create Embedded Accounts using [Account Kit](https://accountkit.alchemy.com/resources/terms.html#account-kit), the Alchemy [Signer](https://accountkit.alchemy.com/resources/terms.html#signer), and the Alchemy [Modular Account](https://accountkit.alchemy.com/resources/terms.html#modular-account).

::: tip Want to test it out right away?
Clone [this Github repo](https://github.com/alchemyplatform/embedded-accounts-quickstart) and follow the `README`.
:::

By the end of this guide, you will have set up a basic web application where users sign up with email, silently deploy a Modular Account onchain, and send UserOperations (UOs) with zero gas using the Alchemy [Rundler](https://accountkit.alchemy.com/resources/terms.html#bundler) and Alchemy [Gas Manager](https://accountkit.alchemy.com/resources/terms.html#gas-manager).

Here's a demo video below of the experience you'll be building!

<VideoEmbed src="/videos/embedded-accounts-full.mp4" />
