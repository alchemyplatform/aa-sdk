---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer
  - - meta
    - name: description
      content: Learn how to get started with the Alchemy Signer
  - - meta
    - property: og:description
      content: Learn how to get started with the Alchemy Signer
  - - meta
    - name: twitter:title
      content: Alchemy Signer
  - - meta
    - name: twitter:description
      content: Learn how to get started with the Alchemy Signer
---

# Alchemy Signer

The Alchemy Signer is a `SmartAccountSigner` that is powered by Alchemy's Signer Infrastructure. Using the Alchemy Signer, you can get started building embedded accounts with just an Alchemy API key!

::: warning
The Alchemy Signer is currently still under development and is not yet available for public use. If you are interested in using the Alchemy Signer, please reach out to us at [account-abstraction@alchemy.com](mailto:account-abstraction@alchemy.com).
:::

## Usage

Once you've been granted access to the Alchemy Signer, getting started is really simple. Install the `@alchemy/aa-alchemy` package and initialize your signer:

<<< @/snippets/signers/alchemy/signer.ts

For other configuration options, see the [Alchemy Signer API Reference](/packages/aa-alchemy/signer/overview).

## Logging Users in

Once you've initialized your signer, you can now enable your users to create an account or login to their existing account.

::: warning
In the coming weeks, the OTP based email auth flow will be replaced with a magic link flow that will make this easier
:::

::: code-group

<<< @/snippets/signers/alchemy/SignupLoginComponent.tsx

<<< @/snippets/signers/alchemy/usePromise.ts
:::

Once your signer is authenticated with a user, you can use it to sign User Operations by creating a `SmartContractAccount` and passing the signer to it.

## Leveraging Persistent Sessions

By default the `AlchemySigner` leverages `localStorage` to cache user sessions for 15 minutes. This can be configured by passing in a `sessionConfig` to your `AlchemySigner` constructor.

You can check if a session exists by doing the following:
::: code-group

```ts
import { signer } from "./signer";

// NOTE: this method throws if there is no authenticated user
// so we return null in the case of an error
const user = await signer.getAuthDetails().catch(() => null);
```

<<< @/snippets/signers/alchemy/signer.ts
:::

If there is an existing session, then your signer is ready for use! If not, see the section above for logging users in.
