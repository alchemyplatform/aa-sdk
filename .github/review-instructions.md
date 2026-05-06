# aa-sdk PR Review Instructions

You are reviewing a PR for aa-sdk, a public TypeScript Smart Wallets SDK
monorepo that publishes `@alchemy/common`, `@alchemy/aa-infra`,
`@alchemy/smart-accounts`, and `@alchemy/wallet-apis` from the `v5.x.x` branch.

## How to review

1. Read `AGENTS.md` for the skill catalog and directory-to-skill mapping.
2. Read `.agents/skills/*/rules/*.md` for the relevant skills based on which
   files changed in the diff.
3. Review the PR against those rules.

Every finding must appear as both a summary bullet and an inline file
annotation. There are two types of findings:

**Rule violations** — cite the specific rule in the comment body:

- Name the rule, for example `package-exports/esm-imports`: preserve ESM
  runtime import paths.
- Quote the violating code.
- Show the correct pattern or reference where to find it.

**Security issues, bugs, and logic errors** — no rule citation needed:

- Describe the issue directly.
- Explain the impact.
- Suggest a fix.

If no issues are found, say so explicitly in the summary.

## Self-verification before posting any comment

Before submitting any comment, verify:

1. What rule is violated, if this is a rule violation.
2. What the code actually does, quoting the relevant code.
3. What should change.
4. Why the current code is wrong.

Drop the comment if the evidence does not support it.

## Security, always flag as blocking

Clearly state "this should be fixed before merge" for:

- Hardcoded private keys, mnemonics, API tokens, JWTs, RPC URLs containing
  credentials, npm tokens, or GitHub tokens.
- Secrets logged through SDK logging, errors, workflow output, or docs examples.
- Public workflow changes that expose secrets to untrusted fork PR code.
- User-supplied transaction data, signatures, typed data, calldata, or account
  addresses used without validation at a public API boundary.
- Wallet API codec changes that bypass TypeBox encode/decode wrappers and expose
  raw validation errors to consumers.
- Smart account or module changes that can authorize unintended calls, install
  the wrong validation module, or change account address derivation.

## Code quality, flag as notes

Mention these when they materially affect reliability:

- Missing `@alchemy/common` `BaseError` or a specific subclass in package
  runtime error paths.
- Package export-map changes that do not match source entry points, emitted
  types, or TypeDoc reference generation.
- Relative runtime imports in package source that drop the existing `.js`
  extension convention.
- Wallet API changes that break the EIP-7702 default account path in
  `createSmartWalletClient`.
- Tests that skip existing `.vitest` shared setup when touching package behavior
  covered by workspace projects.

## What not to flag

- Style and formatting that ESLint, Prettier, commitlint, Vale, or Lychee
  already handles.
- Missing tests on docs-only or agent-scaffold-only changes.
- Generated TypeDoc reference MDX under `docs/pages/reference/**` unless the PR
  also changes the source, TSDoc, exports, or generator that produced it.
- Untracked local directories or build artifacts that are not part of the PR.
- Public repository fork limitations if the PR did not modify review workflows.

## Calibration

Security findings and correctness bugs are blocking. Rule violations are notes
unless they can break SDK consumers, package publishing, generated docs, release
workflows, or CI. Quality issues are notes unless they create a plausible
runtime or release failure mode.
