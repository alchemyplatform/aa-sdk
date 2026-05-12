---
name: documentation
description: |
  Use when editing `docs/**/*.mdx`, generated reference docs, TypeDoc comments,
  `typedoc.json`, `docs/docs.yml`, or documentation review instructions.
last_verified: 2026-05-06
---

# Documentation

aa-sdk documentation is MDX under `docs/`, with committed TypeDoc reference
output under `docs/pages/reference/` and navigation in `docs/docs.yml`.

## Rules

| Rule                                                                  | When to read                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------------ |
| [MDX code preservation](rules/mdx-code-preservation.md)               | Before editing docs code snippets.                           |
| [TypeDoc reference generation](rules/typedoc-reference-generation.md) | Before changing reference docs or TSDoc.                     |
| [docs.yml navigation](rules/docs-yml-navigation.md)                   | Before changing docs navigation or reference nav generation. |

## Evidence

- `typedoc.json` writes `.mdx` output to `docs/pages/reference`.
- `scripts/generate-typedoc-yaml.ts` scans reference MDX and updates
  `docs/docs.yml`.
- Existing `.claude`, `.cursor`, and `.github` docs instructions emphasize code
  snippet preservation.
