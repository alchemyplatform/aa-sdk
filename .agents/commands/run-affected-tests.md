---
description: Run Vitest projects affected by changes from a base branch
argument-hint: [base-branch]
---

# Run Affected Tests

Use when validating package changes without running every package test.

## Steps

1. Choose the base branch. For v5 scaffold work, default to `v5.x.x`.

2. Run the affected-test script:

   ```bash
   ./scripts/run-affected-tests.sh v5.x.x
   ```

3. For a single package while debugging, run the matching Vitest project:

   ```bash
   pnpm vitest run --project=alchemy/wallet-apis
   ```

4. If tests depend on chain fixtures, confirm local prerequisites from
   `.env.example`, `.vitest/`, and the `testing` skill before rerunning.
