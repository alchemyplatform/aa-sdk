# React Native Runtime Constraints

Do not introduce runtime dependencies that known React Native paths explicitly
avoid.

## Why

`packages/wallet-apis/src/utils/format.ts` avoids TypeBox formatters in
`typedDataToJsonSafe` for React Native compatibility. Reintroducing those
runtime dependencies can break React Native consumers.

## Good

Preserve local lightweight formatting in helpers that document React Native
constraints.

## Bad

"Cleaning up" by replacing a React Native safe helper with a TypeBox runtime
formatter without checking the package's runtime support.

## Exceptions

If React Native support changes, update the helper comment, tests, and docs that
describe supported runtimes.
