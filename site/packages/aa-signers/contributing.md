---
outline: deep
head:
  - - meta
    - property: og:title
      content: Contributing to aa-signers
  - - meta
    - name: description
      content: How to add your own Signer Implementation to aa-signers
  - - meta
    - property: og:description
      content: How to add your own Signer Implementation to aa-signers
next:
  text: aa-ethers
---

# Contributing to `aa-signers`

If you are looking to add a new Signer type, please follow the following structure.

1. Create a new folder in `src` with the name of your Signer type in `kebab-case` (we're following kebab casing for files throughout the project).
2. If you require importing an external library for your implementation, add it as an `optionalDependency`
3. Create a new file in the folder you just created called `signer.ts` and add your implementation for `SmartAccountSigner` or `SmartAccountAuthenticator`.
4. If needed, create a file in your folder called `types.ts` and add any necesssary types required for authentication, details, or the inner SDK.
5. Add some tests for your Signer by creating a subfolder in your `signer/my-signer` called `__tests__` and make sure your files end with the `.test.ts` suffix.
6. Export the classes and types you've defined in `src/index.ts`.
7. Open a PR and we'll review it as soon as possible!
