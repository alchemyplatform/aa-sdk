# Main Docs Hooks

Treat main-branch docs hooks as external integrations.

## Why

`revalidate-sdk-content.yml` posts changed `docs/pages/**/*.md` and
`docs/pages/**/*.mdx` paths to the docs site revalidation API on `main`.
`trigger-sdk-indexer.yml` dispatches `index-sdk-references` to
`alchemyplatform/docs` when `docs/docs.yml` changes on `main`.

## Good

- Preserve path filters unless intentionally changing docs publishing behavior.
- Keep secrets referenced as GitHub Actions secrets.
- Verify payload shape before changing API or repository dispatch calls.

## Bad

Running these workflows manually or broadening triggers without explicit user
approval, because they affect external docs systems.

## Exceptions

Local scaffold edits can document these workflows without triggering them.
