# `@alchemy/aa-signers`

This package contains various implementations of the [`SmartAccountSigner`](../core/src/signer/types.ts) and [`AuthSmartAccountSigner`](../core/src/signer/types.ts) classes defined in `aa-core`. This repo is community maintained and we welcome contributions!

## Getting started

If you are already using the `@alchemy/aa-core` package, you can simply install this package and start using the accounts. If you are not using `@alchemy/aa-core`, you can install it and follow the instructions in the [README](../../README.md) to get started.

via `yarn`

```bash
yarn add @alchemy/aa-signers
```

via `npm`

```bash
npm i -s @alchemy/aa-signers
```

## Contributing

If you are looking to add a new account type, please follow the following structure.

1. Create a new folder in `src` with the name of your account type in `kebab-case` (we're following kebab casing for files throughout the project).
2. Create a new file in the folder you just created called `signer.ts` and add your implementation for `SmartAccountSigner`, along with any additional types or utils files.
3. If you need to extend the [`SmartAccountSigner`](../core/src/provider/base.ts) or [`AuthSmartAccountSigner`](../core/src/signer/types.ts) class, add a file called `signer.ts` in a new sub-folder under this package and add your implementation for.

- Ideally, your `SmartAccountSigner` impl should _just_ work with the base provider provided by `aa-core` and whatever peer dependencies you install.
- If not, consider generalizing the use case and updating SmartAccountSigner

5. Add some tests for your account and provider (if created) by creating a subfolder in your `signer/my-signer` called `__tests__` and make sure your files end with the `.test.ts` suffix
6. export the classes and types you've defined in `src/index.ts`
7. Open a PR and we'll review it as soon as possible!
