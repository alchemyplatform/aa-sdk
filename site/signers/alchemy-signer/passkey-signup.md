---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • Passkey Signup
  - - meta
    - name: description
      content: Learn how to sign up users with a newly-created passkey using the Alchemy Signer
  - - meta
    - property: og:description
      content: Learn how to sign up users with a newly-created passkey using the Alchemy Signer
  - - meta
    - name: twitter:title
      content: Alchemy Signer • Passkey Signup
  - - meta
    - name: twitter:description
      content: Learn how to sign up users with a newly-created passkey using the Alchemy Signer
---

# Passkey Signup

The Alchemy Signer allows you to sign up users to your application using a [passkey](https://accountkit.alchemy.com/resources/terms.html#passkey) on their device. All subsequent logins can be done with this [passkey authentication](/signers/alchemy-signer/passkey-auth) guide.

To add passkey signup functionality to your app, you can use the [`authenticate`](/packages/aa-alchemy/signer/authenticate.html#parameters) method on the Alchemy Signer as follows.

::: code-group

<<< @/snippets/signers/alchemy/passkey-signup.ts

<<< @/snippets/signers/alchemy/signer.ts

:::

## Example

<<< @/snippets/signers/alchemy/components/PasskeySignup.tsx
