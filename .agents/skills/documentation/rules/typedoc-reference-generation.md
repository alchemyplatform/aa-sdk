# TypeDoc Reference Generation

Treat `docs/pages/reference/**` as generated TypeDoc output.

## Why

`typedoc.json` writes MDX files to `docs/pages/reference`, and PR CI runs
`pnpm run docs:sdk`, `pnpm run lint:write`, then fails if
`docs/pages/reference/` has uncommitted drift. `docs/docs.yml` is also updated by
the generation script, but the current PR drift gate only checks
`docs/pages/reference/`.

## Good

```bash
pnpm run docs:sdk
pnpm run lint:write
git diff -- docs/pages/reference/ docs/docs.yml
```

Change source TSDoc, package exports, TypeDoc config, or generation scripts
instead of hand-editing generated reference pages.

## Bad

Editing a generated `docs/pages/reference/**/*.mdx` file to fix wording that
comes from a source TSDoc comment.

## Exceptions

Generated reference diffs should be committed when they are the result of
intentional source or generator changes. Review `docs/docs.yml` nav diffs
separately because they are generated but not covered by the current
reference-drift gate.
