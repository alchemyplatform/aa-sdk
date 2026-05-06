# Review Instructions

This repository is the v5 branch of Alchemy's Smart Wallets SDK. It is a public
pnpm/Turborepo/Lerna TypeScript SDK monorepo with committed TypeDoc reference
output and GitHub workflows that publish beta packages from `v5.x.x` and sync
generated reference docs into `main`.

## What Important Means Here

Reserve Important findings for changes that could break SDK consumers, publish
incorrect package artifacts, corrupt generated reference docs, leak secrets, or
make release/docs workflows unsafe. Style, naming, formatting, and missing
lint-only cleanup are Nit at most.

## Do Not Report

- Anything CI already enforces: ESLint, Prettier, PR title commitlint, Vale,
  Lychee, TypeScript syntax, or generated reference drift.
- Generated TypeDoc output under `docs/pages/reference/**` unless the PR also
  changes the source generator, TSDoc, or package exports that produced it.
- `dist/**`, `node_modules/**`, `.turbo/**`, coverage output, or untracked local
  build artifacts.
- Test-only patterns that are intentionally allowed by `.eslintrc`, such as
  plain `Error` in test files.

## Always Check

- Public package export maps in `packages/*/package.json` still match the source
  entry points they publish.
- Package source remains ESM-compatible and uses explicit `.js` extensions for
  relative runtime imports where the existing source does.
- SDK errors in package runtime code use `@alchemy/common` `BaseError` or a more
  specific subclass instead of plain `Error`.
- Wallet API request/response validation keeps using the TypeBox `encode` and
  `decode` wrappers in `packages/wallet-apis/src/utils/schema.ts` when touching
  RPC codec paths.
- `createSmartWalletClient` preserves the EIP-7702 default account behavior when
  no account is passed.
- v5 publish and docs-sync workflows continue to use `v5.x.x` as the v5 source
  branch and `main` as the generated docs PR target.

## Verification Bar

Only post a finding when the changed code and the cited existing source prove
the issue. Prefer fewer high-confidence comments over broad convention advice.
If a generated file changed, identify the source file or generation command that
should have produced it.
