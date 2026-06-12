# @alchemy/api-codegen

Internal (unpublished) codegen tool that generates SDK type internals from the
docs repo's bundled OpenAPI/OpenRPC specs. Design doc: `data-sdk-codegen-plan.md`
(alchemy-cli repo, alongside the data SDK scope plan).

## Two-stage pipeline

```
alchemyplatform/docs (hand-authored YAML)
        │  pnpm snapshot          ← network/local-checkout stage, run rarely
        ▼
specs/*.json + specs.lock.json    ← committed snapshots, pinned by docs SHA + sha256
        │  pnpm generate          ← offline + deterministic, run on every change
        ▼
packages/<target>/src/generated/  ← committed TypeScript (prettier-formatted)
```

- **`pnpm --filter @alchemy/api-codegen snapshot`** — bundles specs from a local
  docs checkout (`--docs <dir>`, `ALCHEMY_DOCS_DIR`, or `../docs` relative to the
  repo root) using the docs repo's own tooling (redocly for OpenAPI, its
  `generate:rpc` script for OpenRPC), copies the bundled JSON into `specs/`, and
  writes `specs.lock.json` (docs commit SHA, branch, sha256 per file). The docs
  working tree must be clean (`--allow-dirty` to override).
- **`pnpm generate`** (root, or `pnpm --filter @alchemy/data-apis generate`) —
  reads only the committed snapshots, verifies checksums against the lockfile,
  and emits TypeScript into the target package. Never touches the network.

## Updating specs

1. Pull/checkout the desired commit in your local docs clone.
2. `pnpm --filter @alchemy/api-codegen snapshot`
3. `pnpm generate`
4. Review the `specs/` + `src/generated/` diff and commit.

## Targets

Each consuming package declares a `codegen.manifest.ts` at its package root
(operationIds / RPC methods → export names, path normalization rules) and a
`generate` script invoking `src/cli.ts --target <name>`. Targets are registered
in `src/targets/`. The generator hard-errors if a manifest references a spec
operation that no longer exists in the snapshot — that's the drift alarm.
