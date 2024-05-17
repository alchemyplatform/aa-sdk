---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • Export Private Key
  - - meta
    - name: description
      content: Learn how to enable a user to export their private key with the Alchemy Signer
  - - meta
    - property: og:description
      content: Learn how to enable a user to export their private key with the Alchemy Signer
  - - meta
    - name: twitter:title
      content: Alchemy Signer • Export Private Key
  - - meta
    - name: twitter:description
      content: Learn how to enable a user to export their private key with the Alchemy Signer
---

# Export private key

The Alchemy Signer allows you to export a user's private key, allowing them a right to exit at any time. It is considered a best practice to allow your users to export their private key, as it gives them full control over their account. The private key export method does not rely on Alchemy's infrastructure, so even if Alchemy is down, a user can still export their private key.

## Usage

To add export private key functionality to your app, you can use the `exportPrivateKey` method on the signer.

::: code-group

<<< @/snippets/signers/alchemy/components/ExportPrivateKey.tsx

<<< @/snippets/signers/alchemy/signer.ts

:::
