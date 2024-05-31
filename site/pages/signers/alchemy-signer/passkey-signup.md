---
outline: deep
title: Alchemy Signer • Passkey Signup
description: Learn how to sign up users with a newly-created passkey using the Alchemy Signer
---

# Passkey Signup

The Alchemy Signer allows you to sign up users to your application using a [passkey](https://accountkit.alchemy.com/resources/terms#passkey) on their device.

To add passkey signup functionality to your app, you can use the [`authenticate`](/packages/aa-alchemy/signer/authenticate#parameters) method on the Alchemy Signer as follows.

:::code-group

```ts [passkey-signup.ts]
// [!include ~/snippets/signers/alchemy/passkey-signup.ts]
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Example

```tsx [PasskeySignup.tsx]
// [!include ~/snippets/signers/alchemy/components/PasskeySignup.tsx]
```
