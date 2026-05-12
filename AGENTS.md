# Agent Router

AI assistants should load skills from `.agents/skills/` based on the task
context. This branch is the v5 SDK branch; use `v5.x.x` as the audit source,
comparison base, and PR base for v5 SDK source and scaffold work unless the
user explicitly asks for another branch. Generated docs sync PRs created by
`update-v5-docs.yml` target `main`.

Do not treat untracked top-level directories as source truth. On this branch,
the tracked workspace is the root config plus `.agents/`, `.claude/`,
`.cursor/`, `.github/`, `.vitest/`, `docs/`, `halp/`, `packages/`, `scripts/`,
and `templates/`.

## Quick Reference

```bash
pnpm install
pnpm run build:libs
pnpm run lint:check
pnpm run lint:write
pnpm run test:ci
pnpm run test:typecheck
./scripts/run-affected-tests.sh v5.x.x
pnpm run docs:sdk
pnpm run lint:docs
pnpm run docs:broken-links
```

For Alchemy engineers, run `npx turbo login --sso-team=alchemy-dot-com` once to
use remote caching.

## Available Skills

| Skill               | Description                                                                             |
| ------------------- | --------------------------------------------------------------------------------------- |
| `tooling`           | pnpm, Turborepo, Lerna, local validation, and generated-output boundaries.              |
| `package-exports`   | Package export maps, ESM import paths, public/internal/experimental surfaces.           |
| `error-handling`    | SDK error hierarchy, `BaseError`, and package error conventions.                        |
| `wallet-apis`       | Wallet API client, Zod codecs, signer/client model, and Solana support.                 |
| `smart-accounts`    | Light Account, Modular Account v1/v2, modules, permissions, and deferred actions.       |
| `testing`           | Vitest workspace, Anvil/Foundry/Rundler setup, and affected test execution.             |
| `documentation`     | MDX docs, TypeDoc reference generation, `docs/docs.yml`, and code snippet preservation. |
| `release-workflows` | npm publish, v5 beta publish, v5 docs sync, and post-merge docs hooks.                  |

## Skill Loading

| Task                                                                                 | Skills to load                                                    |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Adding or changing package exports, barrels, or `package.json` exports               | `package-exports`, `tooling`                                      |
| Editing TypeScript source in `packages/`                                             | `package-exports`, `error-handling`, plus package-specific skills |
| Working on Wallet API client, transport, actions, schemas, or codecs                 | `wallet-apis`, `error-handling`, `testing`                        |
| Working on account implementations, modules, permissions, or deferred actions        | `smart-accounts`, `error-handling`, `testing`                     |
| Writing or modifying tests                                                           | `testing`, `tooling`                                              |
| Editing `.vitest/`, `vitest.workspace.ts`, or test setup                             | `testing`, `tooling`                                              |
| Editing docs or TypeDoc comments                                                     | `documentation`                                                   |
| Editing `docs/pages/reference/`, `typedoc.json`, or `docs/docs.yml`                  | `documentation`, `tooling`                                        |
| Editing `.github/workflows/`, `lerna.json`, version injection, or publish automation | `release-workflows`, `tooling`                                    |
| Creating a PR or evaluating deploy/release safety                                    | `release-workflows`, `tooling`                                    |

## Directory Mapping

| Path                                                                                   | Relevant skills                                                  |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `packages/common/`                                                                     | `package-exports`, `error-handling`, `testing`                   |
| `packages/aa-infra/`                                                                   | `package-exports`, `error-handling`, `testing`                   |
| `packages/smart-accounts/`                                                             | `smart-accounts`, `package-exports`, `error-handling`, `testing` |
| `packages/wallet-apis/`                                                                | `wallet-apis`, `package-exports`, `error-handling`, `testing`    |
| `.vitest/`, `vitest.workspace.ts`, `packages/*/vitest.config.ts`                       | `testing`, `tooling`                                             |
| `templates/`, `halp/`, `turbo.json`, `pnpm-workspace.yaml`, `package.json`             | `tooling`                                                        |
| `docs/**/*.mdx`, `docs/docs.yml`, `typedoc.json`, `tsconfig.typedoc.json`              | `documentation`                                                  |
| `docs/pages/reference/`                                                                | `documentation`                                                  |
| `.github/workflows/`, `.github/actions/`, `lerna.json`, `packages/*/inject-version.ts` | `release-workflows`, `tooling`                                   |

## Project Structure

```text
aa-sdk/
├── .agents/            # Agent skills, commands, and repo guidance
├── packages/
│   ├── common/          # Shared transport, chain, logging, config, and errors
│   ├── aa-infra/        # Rundler fee estimation and RPC types
│   ├── smart-accounts/  # Light Account, Modular Account, modules, permissions
│   └── wallet-apis/     # High-level Wallet API viem client and actions
├── .vitest/             # Shared Vitest setup, Anvil/Rundler fixtures, test helpers
├── docs/                # Fern-style docs and TypeDoc-generated reference MDX
├── scripts/             # TypeDoc navigation, docs sync, affected-test helpers
├── templates/           # Shared TypeScript and ESLint workspace packages
├── halp/                # Internal package scaffolding CLI
└── .github/             # PR checks, publish workflows, docs sync, and instructions
```

## Slash Commands

| Command            | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| `/docs-reviewer`   | Existing Claude command for MDX documentation review.         |
| `/publish-v5-beta` | Checklist for dry-running or publishing the v5 beta workflow. |

## Documentation Discovery

- Check `docs/solutions/` for gotchas before changing workflows, generated docs,
  tests, or package boundaries.
- Trust source files, package configs, scripts, and workflow YAML over stale prose.
- Existing docs AI guidance lives in `.claude/commands/docs-reviewer.md`,
  `.cursor/rules/docs-reviewer.mdc`, `.github/copilot-instructions.md`, and
  `.github/instructions/docsreview.instructions.md`.
