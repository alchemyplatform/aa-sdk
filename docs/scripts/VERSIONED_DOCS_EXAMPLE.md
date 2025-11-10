# Versioned Docs Structure Example

## Overview

This document shows how the tab variants structure works for combining v4 and v5 docs.

## docs.yml Structure

After running `insert-docs-versioned.sh`, the `docs.yml` file will have a structure like this:

```yaml
navigation:
  # ... other tabs ...

  - tab: wallets
    variants:
      - title: Account Kit v4
        slug: v4
        default: false
        layout:
          - section: Getting Started
            contents:
              - page: Introduction
                path: wallets-v4/pages/getting-started/intro.mdx
              - page: Quick Start
                path: wallets-v4/pages/getting-started/quick-start.mdx
          - section: SDK Reference
            contents:
              # ... v4 SDK reference pages ...

      - title: Account Kit v5
        slug: v5
        default: true
        layout:
          - section: Getting Started
            contents:
              - page: Introduction
                path: wallets-v5/pages/getting-started/intro.mdx
              - page: Quick Start
                path: wallets-v5/pages/getting-started/quick-start.mdx
          - section: SDK Reference
            contents:
              # ... v5 SDK reference pages ...
```

## URL Structure

With this configuration:

- **v4 docs**: `https://alchemy.com/docs/wallets/v4/...`
- **v5 docs**: `https://alchemy.com/docs/wallets/v5/...` (default)

## Directory Structure

```
docs-site/
└── fern/
    ├── wallets-v4/           # v4 docs from main branch
    │   ├── pages/
    │   ├── shared/
    │   ├── components/
    │   └── docs.yml          # Original v4 navigation
    ├── wallets-v5/           # v5 docs from blake/merge-v4-and-v5 branch
    │   ├── pages/
    │   ├── shared/
    │   ├── components/
    │   └── docs.yml          # Original v5 navigation
    ├── images/
    │   └── wallets/          # Shared images from both versions
    └── docs.yml              # Main docs.yml with tab variants
```

## How It Works

1. **Checkout both branches**: The GHA workflow checks out both `main` (v4) and `blake/merge-v4-and-v5` (v5)
2. **Extract code snippets**: Runs `extract-include-statements.js` on both branches independently
3. **Copy to versioned dirs**: Copies v4 docs to `fern/wallets-v4/` and v5 docs to `fern/wallets-v5/`
4. **Build tab variants**: Extracts navigation from both `docs.yml` files and combines them into a tab variants structure
5. **Update paths**: Rewrites all paths in the navigation to point to the versioned directories

## User Experience

When users visit the Wallets tab, they'll see a variant selector (dropdown or toggle) that lets them switch between:

- **Account Kit v4** - Documentation for the current stable version
- **Account Kit v5** (default) - Documentation for the new version

The variant selector is provided automatically by Fern based on the `variants` configuration.

## Benefits

✅ **No merge conflicts** - v4 and v5 docs remain completely separate
✅ **Independent code snippets** - Each version extracts snippets from its own source code
✅ **Clear versioning** - Users can easily switch between versions
✅ **Easy cleanup** - When v4 is deprecated, just remove the v4 variant and directory
✅ **Single deployment** - Both versions deploy together from the same workflow
