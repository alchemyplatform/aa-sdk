---
title: Contributing to aa-accounts
description: How to add your own Account implementation to aa-accounts
---

# Contributing to `aa-accounts`

If you are looking to add a new account type, please follow the following structure.

1. Create a new folder in `src` with the name of your account type in `kebab-case` (we are following kebab casing for files throughout the project).
2. Create a new file in the folder you just created called `account.ts` and add a method that calls `toSmartContractAccount` to return an instance of your account.
3. If needed, create a sub-folder in your account folder called `abis` and add your abis as `.ts` files. eg:

```ts
export const MyContractAbi = [
  // ...
] as const; // the as const is important so we can get correct typing from viem
```

4. If you want, you can create a client creation method that returns a `SmartAccountClient` instance with your account attached to it
5. Add some tests for your account and client (if created) by creating a subfolder in your `account/my-account` called `__tests__` and make sure your files end with the `.test.ts` suffix
6. Export the classes and types you have defined in `src/index.ts`
7. Open a PR and we will review it as soon as possible!
