---
title: Solutions Guide
date: 2026-05-06
tags:
  - agents
  - solutions
area: meta
---

# Solutions Guide

These docs capture non-obvious aa-sdk gotchas discovered while working on the
repo. They are reference material, not authoritative rules. If a solution doc
contradicts the current code, trust the code.

## Format

Each entry should include frontmatter:

```yaml
---
title: Short Title
date: YYYY-MM-DD
tags:
  - topic
area: package-or-workflow
---
```

Use these sections:

- Problem
- Root Cause
- Solution

Keep entries narrow. Prefer one gotcha per file so agents can find and update
the relevant note without rewriting unrelated guidance.
