# Tracked Tree Only

When auditing this branch or writing agent guidance, use tracked files on
`main` as source truth.

## Why

Local checkouts may contain untracked generated or experimental directories.
Those are not part of the v5 SDK contract and should not influence scaffold
rules, review instructions, or command guidance.

## Good

```bash
git ls-files
git status --short --branch
```

Use `git ls-files <path>` to confirm a file or directory is tracked before
treating it as repository behavior.

## Bad

Deriving project structure from untracked top-level directories or generated
local build output.

## Exceptions

If the user explicitly asks about an untracked path, inspect it as user-local
work and call out that it is not tracked on `main`.
