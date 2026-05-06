---
description: Regenerate TypeDoc SDK reference docs and navigation
argument-hint: [optional package or source path]
---

# Regenerate SDK Reference

Use when public TypeScript API, TSDoc, TypeDoc config, or reference navigation
changes.

## Steps

1. Confirm the change is on the v5 branch context unless the user specified
   otherwise:

   ```bash
   git branch --show-current
   ```

2. Generate package builds, TypeDoc MDX, and `docs/docs.yml` reference nav:

   ```bash
   pnpm run docs:sdk
   ```

3. Apply repo formatting after generation:

   ```bash
   pnpm run lint:write
   ```

4. Review generated diffs:

   ```bash
   git diff -- docs/pages/reference/ docs/docs.yml
   ```

5. If CI still reports drift, trust the source and generator inputs over manual
   edits to generated MDX.
