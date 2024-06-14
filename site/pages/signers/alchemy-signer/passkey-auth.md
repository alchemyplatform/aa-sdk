---
outline: deep
title: Alchemy Signer • Passkey Auth
description: Learn how to authenticate users with their passkey using the Alchemy Signer
---

# Passkey Auth

The Alchemy Signer allows you to authenticate and log in users with a [passkey](https://accountkit.alchemy.com/resources/terms#passkey) that they used previously to sign up to your application.

To add passkey auth functionality to your app, you can use the [`authenticate`](/packages/aa-alchemy/signer/authenticate#parameters) method on the Alchemy Signer as follows.

:::code-group

```ts [passkey-auth.ts]
// [!include ~/snippets/signers/alchemy/passkey-auth.ts]
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Example

```tsx [PasskeyAuth.tsx]
// [!include ~/snippets/signers/alchemy/components/PasskeyAuth.tsx]
```
