# Deferred Actions

Keep deferred action helpers consistent across encoding, signing, and execution.

## Why

Deferred action types and helpers are part of the public smart-accounts surface.
Changing one side of encoding or signature handling without the other can create
runtime failures that TypeScript alone may not catch.

## Good

- Update the type aliases, encoder, decoder, and tests together.
- Verify signatures and serialized action payloads still match expected account
  behavior.
- Regenerate reference docs after public TSDoc or export changes.

## Bad

Changing a deferred action type without updating the corresponding encode or
signature helper.

## Exceptions

Pure TSDoc wording changes still require `pnpm run docs:sdk` if they affect
published reference docs.
