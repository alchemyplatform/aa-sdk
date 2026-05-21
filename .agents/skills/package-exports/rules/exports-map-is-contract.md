# Exports Map Is Contract

Treat each package's `exports` map as the public contract for consumers.

## Why

The packages publish ESM and type declarations from `dist/esm` and `dist/types`.
Changing source barrels without updating the matching `exports` map, TypeDoc
entry point, or generated docs can create broken imports for SDK users.

## Good

- Add public package API to the source entry point that the `exports` map points
  at.
- Verify the package build emits both `dist/esm/...js` and `dist/types/...d.ts`
  paths referenced in `package.json`.
- Run `pnpm run build:libs` after export-map changes.

## Bad

- Importing from unpublished `src/` paths in examples or docs.
- Adding a subpath export in source without adding the matching
  `package.json` `exports` entry.

## Exceptions

Test files may import package internals when that is the established local
pattern for exercising behavior that is not exported.
