---
name: package-exports
description: |
  Use when changing package entry points, `exports` maps, public API barrels,
  import paths, or subpath exports in aa-sdk packages.
last_verified: 2026-05-06
---

# Package Exports

aa-sdk publishes four ESM packages from `packages/*`. Public API contracts are
defined by each package's `package.json` `exports` map and source entry points.

## Rules

| Rule                                                                              | When to read                                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [Exports map is contract](rules/exports-map-is-contract.md)                       | Before adding, removing, or renaming public exports.            |
| [ESM imports](rules/esm-imports.md)                                               | Before changing runtime imports in package source.              |
| [Internal and experimental subpaths](rules/internal-and-experimental-subpaths.md) | Before using or changing `internal` or `experimental` subpaths. |

## Evidence

- `packages/common/package.json` exports `.`, `./chains`, and `./internal`.
- `packages/wallet-apis/package.json` exports `.`, `./experimental`, and `./internal`.
- `packages/aa-infra/package.json` and `packages/smart-accounts/package.json`
  export their root entry point.
