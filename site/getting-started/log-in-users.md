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

# Log users into Embedded Accounts

In this section of the Embedded Accounts Quickstart, you'll create your app's log in experience, where users will log in to receive an email to authenticate themselves on your app, creating their Embedded Account.

## Add Log In User Interface

To create the user log in experience, add a `src/components` folder and create `src/components/LogInCard.tsx` and `src/components/TurnkeyIframe.tsx` with the following:

::: code-group

<<< @/snippets/getting-started/log-in-users/LogInCard-1.tsx [src/components/LogInCard.tsx]

<<< @/snippets/getting-started/log-in-users/TurnkeyIframe.tsx [src/components/TurnkeyIframe.tsx]

:::

`src/components/LogInCard.tsx` creates the UI for your app, while `src/components/TurnkeyIframe.tsx` embeds a hidden iframe in your app that the Alchemy Signer will use to send the user an email and authenticate them. You'll configure the Alchemy Signer in the next step.

Now, incorporate these components into your app by updating the `src/app/page.tsx` file as follows:

<<< @/snippets/getting-started/log-in-users/page-1.tsx [src/app/page.tsx]

You've now added the UI for your app! At this point, run the application using:

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

Your application should look like the below image!

<img src="/images/getting-started/embedded-accounts-ui.png" alt="Embedded Accounts UI" />

In the next step, you'll add functionality to the “Log In” button to send an email to the user to authenticate them.

## Support Email Auth with Alchemy Signer

To support email authentication using the Alchemy Signer to created Embedded Accounts, update your `src/components/LogInCard.tsx` file:

<<< @/snippets/getting-started/log-in-users/LogInCard-2.tsx [src/components/LogInCard.tsx]

You'll also want a new UI to display a user's Embedded Account address and their authenticated email when they redirect from the email they receive to log into your app. Add a UI card called `src/app/components/ProfileCard.tsx` and drop in the following code:

<<< @/snippets/getting-started/log-in-users/ProfileCard.tsx [src/app/components/ProfileCard.tsx]

Lastly, update the UI in `src/app/page.tsx` to render either the `src/app/components/LogInCard.tsx` or `src/app/components/ProfileCard.tsx` if the user has authenticated upon redirect from email.

<<< @/snippets/getting-started/log-in-users/page-2.tsx [src/app/page.tsx]

You've now added the full authentication flow for users to create Embedded Accounts. At this point, run the application using:

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

The experience should look like the video below!

<VideoEmbed src="/videos/embedded-accounts-auth.mp4" />
