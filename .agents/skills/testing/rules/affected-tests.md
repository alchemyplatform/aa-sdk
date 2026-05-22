# Affected Tests

Use the repo's affected-test script when validating package changes against a
base branch.

## Why

`scripts/run-affected-tests.sh` asks Turborepo which `packages/*` projects are
affected by changes from `origin/<base>...HEAD`, then runs one Vitest process
with the matching `--project=alchemy/<package>` flags.

## Good

```bash
./scripts/run-affected-tests.sh main
```

The script defaults to `main` when no base branch is provided, so plain
`./scripts/run-affected-tests.sh` is equivalent. Pass `v4.x.x` only when
validating a backport to the legacy v4 branch.

For targeted checks:

```bash
pnpm vitest run --project=alchemy/common
```

## Bad

Running multiple package Vitest processes concurrently when they may compete for
ports or shared local chain fixtures.

## Exceptions

When debugging one failing test, run the narrowest package/project and test name
that reproduces the failure.
