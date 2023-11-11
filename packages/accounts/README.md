# `@alchemy/aa-accounts`

This package contains various implementations of the [`BaseSmartContractAccount`](https://accountkit.alchemy.com/packages/aa-core/accounts/introduction.html#basesmartcontractaccount) class defined in `aa-core`. This repo is community maintained and we welcome contributions!

## Getting started

If you are already using the `@alchemy/aa-core` package, you can simply install this package and start using the accounts. If you are not using `@alchemy/aa-core`, you can install it and follow the instructions in the [Getting Started](https://accountkit.alchemy.com/packages/aa-accounts/) docs to get started.

via `yarn`

```bash
yarn add @alchemy/aa-accounts
```

via `npm`

```bash
npm i -s @alchemy/aa-accounts
```

via `pnpm`

```bash
pnpm i @alchemy/aa-accounts
```

## Contributing

If you are looking to add a new account type, please follow the following structure.

1. Create a new folder in `src` with the name of your account type in `kebab-case` (we're following kebab casing for files throughout the project).
2. Create a new file in the folder you just created called `account.ts` and add your implementation for `BaseSmartContractAccount`
3. If needed, create a sub-folder in your account folder called `abis` and add your abis as `.ts` files. eg:

```ts
export const MyContractAbi = [] as const; // the as const is important so we can get correct typing from viem
```

4. If you need to extend the [`SmartAccountProvider`](https://accountkit.alchemy.com/packages/aa-core/provider/introduction.html) class, add a file called `provider.ts` and add your implementation for `SmartAccountProvider`.

- Ideally, your `Account` impl should _just_ work with the base provider provided by `aa-core`.
- If not, consider generalizing the use case and updating SmartAccountProvider

5. Add some tests for your account and provider (if created) by creating a subfolder in your `account/my-account` called `__tests__` and make sure your files end with the `.test.ts` suffix
6. export the classes and types you've defined in `src/index.ts`
7. Open a PR and we'll review it as soon as possible!
