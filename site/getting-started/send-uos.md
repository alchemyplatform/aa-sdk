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

# Send UserOperations

In this last section, you will enable users to send UserOperations through their newly created Embedded Account on your app.

## Add button to Send UserOperations

Create a new file `src/queries/sendUserOperation.tsx` and add the following:

<<< @/snippets/getting-started/send-uos/sendUserOperation.tsx [src/queries/sendUserOperation.tsx]

This method will send a request to Alchemy's infrastructure to send a UserOperation. It uses the `AlchemySmartAccountClient` from the Alchemy Account Kit. Check out the [AlchemySmartAccountClient docs](https://accountkit.alchemy.com/packages/aa-alchemy/smart-account-client/) for more details.

## Update the Profile UI

Now, incorporate this request on a new `src/components/SendUOButton.tsx` file and add it to the `src/components/ProfileCard.tsx` for authenticated users to send a UO. These files should look as follows:

::: code-group

<<< @/snippets/getting-started/send-uos/ProfileCard.tsx [src/components/ProfileCard.tsx]

<<< @/snippets/getting-started/send-uos/SendUOButton.tsx [src/components/SendUOButton.tsx]

:::

That's it! At this point, run the application using:

::: code-group

```bash [npm]
npm run dev
```

```bash [yarn]
yarn dev
```

```bash [pnpm]
pnpm run dev
```

:::

You've now enabled users to sendUOs from their Embedded Account on your application, and the experience should look like the video below!

<VideoEmbed src="/videos/embedded-accounts-full.mp4" />

Congratulations! Using Account Kit, the Alchemy Signer, and Alchemy Modular Account, you created an application that authenticates a user by email to create their Embedded Account, and then uses that account to send a UserOperation!

## Dive Deeper

You can do so much more with Embedded Accounts than this Quickstart guide could share!

1. To learn more about the Alchemy Signer and how to support passkey login (and eventually social login), check out the technical [docs](https://accountkit.alchemy.com/packages/aa-alchemy/signer/overview.html) for more details.
2. To learn more about different smart account options available for your applications, check out the section **[Choosing a smart account](https://accountkit.alchemy.com/smart-accounts/)**.
3. To learn more about how to use your smart accounts and what Account Kit offers to enhance users' web3 experiences, check out a number of guides we have in the **[Using smart accounts](https://accountkit.alchemy.com/using-smart-accounts/send-user-operations.html)** section, covering from basic to advanced usages.
