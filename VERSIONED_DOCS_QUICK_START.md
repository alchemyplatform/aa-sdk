# 🚀 Versioned Docs Quick Start

## What Was Built

A complete solution for deploying **v4 and v5 wallet docs simultaneously** using Fern's Tab Variants feature on your `blake/merge-v4-and-v5` branch.

## 📁 Files Created

```
aa-sdk/
├── .github/
│   ├── actions/
│   │   └── setup-docs-versioned/
│   │       └── action.yml ⭐ (GHA composite for CI/CD)
│   └── workflows/
│       ├── preview-fern-docs-versioned.yml.example 📋
│       └── publish-fern-docs-versioned.yml.example 📋
│
└── docs/
    └── scripts/
        ├── insert-docs-versioned.sh ⭐ (Main merging script)
        ├── docs-dev-versioned.sh 🛠️ (Local development)
        ├── validate-versioned-setup.sh ✓ (Validation)
        │
        ├── VERSIONED_DOCS_SUMMARY.md 📖
        ├── VERSIONED_DOCS_IMPLEMENTATION_GUIDE.md 📖
        └── VERSIONED_DOCS_EXAMPLE.md 📖
```

## 🎯 How It Works

Your users will see a **variant selector** in the Wallets tab that lets them toggle between:

- **Account Kit v4** (from `main` branch) → `/wallets/v4/...`
- **Account Kit v5** (from `blake/merge-v4-and-v5` branch) → `/wallets/v5/...` ⭐ default

Both versions:

- ✅ Have their own independent code snippets extracted from source
- ✅ Have their own navigation structure
- ✅ Deploy together in a single workflow
- ✅ Are completely isolated (no merge conflicts)

## 🏃 Try It Now

### Test Locally (Recommended First Step)

```bash
cd /Users/blake.duncan/Documents/workspace/aa-sdk

# Option 1: See only your current branch (v5)
./docs/scripts/docs-dev-versioned.sh

# Option 2: See both v4 and v5 together
./docs/scripts/docs-dev-versioned.sh --dual
```

Then visit http://localhost:3020 and:

1. Navigate to the Wallets tab
2. Look for the variant selector
3. Toggle between v4 and v5
4. Verify both versions work correctly

### Validate Setup

```bash
./docs/scripts/validate-versioned-setup.sh
```

This checks that all files exist, are executable, and have valid syntax.

## 📚 Documentation

1. **Start here** → `VERSIONED_DOCS_SUMMARY.md` (overview)
2. **Deploy guide** → `VERSIONED_DOCS_IMPLEMENTATION_GUIDE.md` (step-by-step)
3. **Structure examples** → `VERSIONED_DOCS_EXAMPLE.md` (what the output looks like)

## 🚢 Deploy to Preview

When you're ready to test in CI:

```bash
# 1. Activate the preview workflow
mv .github/workflows/preview-fern-docs-versioned.yml.example \
   .github/workflows/preview-fern-docs-versioned.yml

# 2. Commit and push
git add .
git commit -m "test: Enable versioned docs preview"
git push

# 3. Open a PR and check the preview URL
```

## 🚢 Deploy to Production

See the complete deployment guide in:

```
docs/scripts/VERSIONED_DOCS_IMPLEMENTATION_GUIDE.md
```

## ⚙️ Key Configuration

All configurations are in these places:

### Branch Names

**File**: `.github/actions/setup-docs-versioned/action.yml`

```yaml
inputs:
  v4-branch:
    default: "main" # ← v4 source
  v5-branch:
    default: "blake/merge-v4-and-v5" # ← v5 source
```

### Default Version

**File**: `docs/scripts/insert-docs-versioned.sh` (around line 95)

```bash
- title: Account Kit v5
  default: true  # ← Change to false to make v4 default
```

### Variant Titles

**File**: `docs/scripts/insert-docs-versioned.sh` (around line 90)

```bash
- title: Account Kit v4  # ← Change display name
  slug: v4              # ← Change URL slug
```

## 🎨 What Users See

```
┌─────────────────────────────────────────────────────────┐
│  Alchemy Docs                                           │
├─────────────────────────────────────────────────────────┤
│  [APIs] [NFTs] [Webhooks] [Wallets] ← tabs             │
│                            ↑                            │
│                       Wallets selected                   │
│                                                         │
│  ┌──────────────────────────────────────┐              │
│  │  Variant: [Account Kit v5 ▼]         │ ← selector   │
│  │           ─────────────────           │              │
│  │          │ Account Kit v4  │          │              │
│  │          │ Account Kit v5 ✓│          │              │
│  │           ─────────────────           │              │
│  └──────────────────────────────────────┘              │
│                                                         │
│  Getting Started                                        │
│    → Introduction                                       │
│    → Quick Start                                        │
│                                                         │
│  SDK Reference                                          │
│    → Infra                                             │
│    → Common                                            │
│    ...                                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Architecture Summary

```
GH Actions Workflow
    ↓
Checkout v5 branch (current)
    ↓
Create worktree for v4 (main)
    ↓
Extract snippets from v4 → /tmp/aa-sdk-v4/docs
Extract snippets from v5 → ./docs
    ↓
insert-docs-versioned.sh
    ├── Copy v4 → docs-site/fern/wallets-v4/
    ├── Copy v5 → docs-site/fern/wallets-v5/
    ├── Extract navigation from both
    ├── Create tab variants structure:
    │     - Account Kit v4 (slug: v4)
    │     - Account Kit v5 (slug: v5, default)
    └── Update paths in docs.yml
    ↓
Deploy to Fern
    ↓
Users see both versions! 🎉
```

## ✅ Benefits

- **No merge conflicts** - Branches stay separate
- **Independent code** - Snippets extracted from each version's source
- **Clean URLs** - `/v4/...` and `/v5/...`
- **Easy toggle** - Users can switch versions instantly
- **Hot reload** - Local dev supports live updates
- **Single deploy** - Both versions deploy together
- **Easy cleanup** - Just remove v4 variant when ready

## 🎓 Learning Resources

- **Fern Tab Variants**: https://buildwithfern.com/learn/docs/configuration/tabs#tab-variants
- **Implementation Guide**: `docs/scripts/VERSIONED_DOCS_IMPLEMENTATION_GUIDE.md`

## 🐛 Troubleshooting

| Issue                         | Solution                                             |
| ----------------------------- | ---------------------------------------------------- |
| "wallets directory not found" | Use `insert-docs-versioned.sh`, not `insert-docs.sh` |
| Port 3020 in use              | `lsof -ti:3020 \| xargs kill -9`                     |
| Images not loading            | Check `fern/images/wallets/` exists                  |
| Dual mode requires clean git  | Commit or stash changes first                        |

## 📞 Next Steps

1. ✅ **Validate** → `./docs/scripts/validate-versioned-setup.sh`
2. 🧪 **Test locally** → `./docs/scripts/docs-dev-versioned.sh --dual`
3. 📖 **Read guide** → `docs/scripts/VERSIONED_DOCS_IMPLEMENTATION_GUIDE.md`
4. 🚀 **Deploy preview** → Activate workflow and test
5. 🎉 **Deploy production** → Follow deployment guide

---

## 🎉 You're Ready!

Everything is built and ready to test. Start with local testing, then move to preview, then production.

**Questions?** Check the comprehensive guide:

```
docs/scripts/VERSIONED_DOCS_IMPLEMENTATION_GUIDE.md
```

Good luck! 🚀
