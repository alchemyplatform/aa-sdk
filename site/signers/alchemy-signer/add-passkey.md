---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • Add Passkey
  - - meta
    - name: description
      content: Learn how to add a new passkey to a user's account using the Alchemy Signer
  - - meta
    - property: og:description
      content: Learn how to add a new passkey to a user's account using the Alchemy Signer
  - - meta
    - name: twitter:title
      content: Alchemy Signer • Add Passkey
  - - meta
    - name: twitter:description
      content: Learn how to add a new passkey to a user's account using the Alchemy Signer
---

# Add Passkey

The Alchemy Signer allows your users to add another [passkey](https://accountkit.alchemy.com/resources/terms.html#passkey) to their account after they have already signed up to your application.

To add passkey, you can use the [`addPasskey`](/packages/aa-alchemy/signer/addPasskey.html#parameters) method on the Alchemy Signer as follows.

::: code-group

<<< @/snippets/signers/alchemy/add-passkey.ts

<<< @/snippets/signers/alchemy/signer.ts

:::

## Example

<<< @/snippets/signers/alchemy/components/AddPasskey.tsx
