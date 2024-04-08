---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • Email Auth
  - - meta
    - name: description
      content: Learn how to authenticate users with their email using the Alchemy Signer
  - - meta
    - property: og:description
      content: Learn how to authenticate users with their email using the Alchemy Signer
  - - meta
    - name: twitter:title
      content: Alchemy Signer • Email Auth
  - - meta
    - name: twitter:description
      content: Learn how to authenticate users with their email using the Alchemy Signer
---

# Email Auth

The Alchemy Signer allows you to authenticate and log in users with their email that they used previously to sign up to your application.

To add email auth functionality to your app, you can use the [`authenticate`](/packages/aa-alchemy/signer/authenticate.html#parameters) method on the Alchemy Signer as follows.

::: code-group

<<< @/snippets/signers/alchemy/email-auth.ts

<<< @/snippets/signers/alchemy/signer.ts

:::

## Example

<<< @/snippets/signers/alchemy/components/EmailAuth.tsx
