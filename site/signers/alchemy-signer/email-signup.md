---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • Email Signup
  - - meta
    - name: description
      content: Learn how to sign up users with their email using the Alchemy Signer
  - - meta
    - property: og:description
      content: Learn how to sign up users with their email using the Alchemy Signer
  - - meta
    - name: twitter:title
      content: Alchemy Signer • Email Signup
  - - meta
    - name: twitter:description
      content: Learn how to sign up users with their email using the Alchemy Signer
---

# Email Signup

The Alchemy Signer allows you to sign up users to your application using their email. All subsequent logins can be done with this [email authentication](/signers/alchemy-signer/email-auth) guide.

To add email signup functionality to your app, you can use the [`authenticate`](/packages/aa-alchemy/signer/authenticate.html#parameters) method on the Alchemy Signer as follows.

::: code-group

<<< @/snippets/signers/alchemy/email-signup.ts

<<< @/snippets/signers/alchemy/signer.ts

:::

## Example

<<< @/snippets/signers/alchemy/components/EmailSignup.tsx
