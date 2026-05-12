# Modules and Permissions

Treat module and permission-builder changes as account-behavior changes.

## Why

Modules such as allowlists, paymaster guards, and validation helpers affect what
accounts can execute. Permission builder errors are exported as part of the SDK
surface, so changes are visible to consumers.

## Good

- Preserve explicit error types for invalid module or permission states.
- Test install, uninstall, serialization, and validation behavior for changed
  modules.
- Keep exported permission-builder names stable unless intentionally breaking.

## Bad

Silently dropping validation to make module serialization pass.

## Exceptions

Docs-only changes can describe modules without adding tests, but code snippets
must keep exact function names and property names.
