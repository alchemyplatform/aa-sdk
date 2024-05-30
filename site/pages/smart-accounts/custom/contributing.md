---
title: Contributing Your Account
description: Follow this guide to contribute a new smart account to Account Kit
  documentation.
---

# Contribute your account

If you would like to add your smart account to Account Kit, we welcome PRs! You will need to fork the [`aa-sdk`](https://github.com/alchemyplatform/aa-sdk) Github repo, and then follow the below steps.

## 1. Add your Smart Account to [`aa-accounts`](https://github.com/alchemyplatform/aa-sdk/tree/main/packages/accounts)

To ensure the best developer experience for anyone using Account Kit, we ask that you add your smart account implementation to our [`aa-accounts`](https://github.com/alchemyplatform/aa-sdk/tree/main/packages/accounts) SDK package.

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

## 2. Submit a pull request

You can open a PR to merge the branch with your smart account implementation from your forked repo into the `main` branch of the `aa-sdk` repo. We will review it promptly, provide feedback, and merge the PR when ready so developers can use your smart account!
