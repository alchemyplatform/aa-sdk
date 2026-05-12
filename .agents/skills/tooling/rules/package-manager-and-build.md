# Package Manager and Build

Use pnpm for all package operations. The root `package.json` pins
`pnpm@9.15.4`, and `pnpm-workspace.yaml` defines the workspaces.

## Why

The repo's scripts assume pnpm workspace resolution and Turborepo task graphs.
Using npm, yarn, or ad hoc package installs can change lockfiles and bypass the
workspace package links used by `templates/*`, `.vitest`, `halp`, and
`packages/*`.

## Good

```bash
pnpm install
pnpm run build:libs
pnpm run lint:check
pnpm run test:typecheck
```

Use package-scoped scripts from the package directory only when you are
deliberately narrowing the check.

## Bad

```bash
npm install
yarn test
npx turbo run build
```

## Exceptions

GitHub workflows currently use `npx` for specific commands like `semver`,
`lerna`, and `tsx`. Do not rewrite those unless you are intentionally changing
the workflow and have verified the command behavior.
