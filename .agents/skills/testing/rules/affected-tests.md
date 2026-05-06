# Affected Tests

Use the repo's affected-test script when validating package changes against a
base branch.

## Why

`scripts/run-affected-tests.sh` asks Turborepo which `packages/*` projects are
affected by changes from `origin/<base>...HEAD`, then runs one Vitest process
with the matching `--project=alchemy/<package>` flags.

## Good

```bash
./scripts/run-affected-tests.sh v5.x.x
```

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
