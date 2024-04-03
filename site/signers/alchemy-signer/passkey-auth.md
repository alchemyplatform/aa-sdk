---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • Passkey Auth
  - - meta
    - name: description
      content: Learn how to authenticate users with their passkey using the Alchemy Signer
  - - meta
    - property: og:description
      content: Learn how to authenticate users with their passkey using the Alchemy Signer
  - - meta
    - name: twitter:title
      content: Alchemy Signer • Passkey Auth
  - - meta
    - name: twitter:description
      content: Learn how to authenticate users with their passkey using the Alchemy Signer
---

# Passkey Auth

The Alchemy Signer allows you to authenticate and log in users with a [passkey](https://accountkit.alchemy.com/resources/terms.html#passkey) on their device that they used previously to sign up to your application.

To add passkey auth functionality to your app, you can use the [`authenticate`](/packages/aa-alchemy/signer/authenticate.html#parameters) method on the Alchemy Signer as follows.

::: code-group

<<< @/snippets/signers/alchemy/passkey-auth.ts

<<< @/snippets/signers/alchemy/signer.ts

:::

## Example

<<< @/snippets/signers/alchemy/components/PasskeyAuth.tsx
