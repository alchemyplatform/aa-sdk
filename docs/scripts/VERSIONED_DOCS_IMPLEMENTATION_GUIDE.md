# Versioned Docs Implementation Guide

## 📋 Overview

This guide explains how to deploy and maintain v4 and v5 wallet docs simultaneously using Fern's tab variants feature.

## 🏗️ Architecture

### Components Created

1. **`insert-docs-versioned.sh`** - Main script that handles copying and merging docs from both branches
2. **`setup-docs-versioned/action.yml`** - GHA composite action that orchestrates the versioned build
3. **`docs-dev-versioned.sh`** - Local development script with optional dual-version support
4. **Example workflows** - Templates for publish and preview workflows

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions Workflow                                     │
│                                                              │
│  1. Checkout current branch (v5)                            │
│  2. Create git worktree for main branch (v4)               │
│  3. Extract code snippets from both branches independently   │
│  4. Copy v4 docs → fern/wallets-v4/                         │
│  5. Copy v5 docs → fern/wallets-v5/                         │
│  6. Merge navigation into tab variants structure             │
│  7. Deploy to Fern                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Steps

### Step 1: Test Locally

First, test the single-version mode (shows only your current branch):

```bash
cd /path/to/aa-sdk
./docs/scripts/docs-dev-versioned.sh
```

Then test dual-version mode (shows both v4 and v5):

```bash
# Make sure you have no uncommitted changes
git status

# Run in dual mode
./docs/scripts/docs-dev-versioned.sh --dual
```

Visit http://localhost:3020 and verify:

- ✅ Wallets tab shows a variant selector
- ✅ Can switch between "Account Kit v4" and "Account Kit v5"
- ✅ Both versions display correctly
- ✅ Code snippets are working in both versions

### Step 2: Test in Preview

Create a test PR from your `blake/merge-v4-and-v5` branch:

1. Temporarily activate the preview workflow:

   ```bash
   mv .github/workflows/preview-fern-docs-versioned.yml.example \
      .github/workflows/preview-fern-docs-versioned.yml
   ```

2. Commit and push:

   ```bash
   git add .github/workflows/preview-fern-docs-versioned.yml
   git commit -m "test: Enable versioned docs preview"
   git push
   ```

3. Open a PR and wait for the preview to build

4. Review the preview URL and verify both v4 and v5 docs are working

### Step 3: Deploy to Production

Once testing is complete:

1. **Activate the versioned publish workflow:**

   ```bash
   mv .github/workflows/publish-fern-docs-versioned.yml.example \
      .github/workflows/publish-fern-docs-versioned.yml
   ```

2. **Decide whether to keep or disable old workflows:**

   Option A - Disable old workflows (recommended):

   ```bash
   mv .github/workflows/publish-fern-docs.yml \
      .github/workflows/publish-fern-docs.yml.disabled
   mv .github/workflows/preview-fern-docs.yml \
      .github/workflows/preview-fern-docs.yml.disabled
   ```

   Option B - Delete old workflows:

   ```bash
   git rm .github/workflows/publish-fern-docs.yml
   git rm .github/workflows/preview-fern-docs.yml
   ```

3. **Update the versioned workflow branch triggers:**

   Edit `.github/workflows/publish-fern-docs-versioned.yml`:

   ```yaml
   on:
     push:
       branches:
         - main # Change from blake/merge-v4-and-v5 to main
   ```

4. **Merge to main:**
   ```bash
   git add .
   git commit -m "feat: Enable versioned v4/v5 docs with tab variants"
   # Create PR and merge to main
   ```

## 🔧 Configuration

### Changing Branch Names

If your branch names change, update the workflow inputs:

```yaml
- name: Setup Versioned Docs
  uses: ./.github/actions/setup-docs-versioned
  with:
    docs-github-token: ${{ github.token }}
    v4-branch: main # ← Change this
    v5-branch: your-v5-branch # ← Change this
```

### Changing Variant Titles

Edit the `insert-docs-versioned.sh` script:

```bash
# Around line 90-95
cat > fern/temp_wallets_variants.yml << 'EOF'
  - tab: wallets
    variants:
      - title: Account Kit v4        # ← Change this
        slug: v4
        default: false
        layout:
EOF
```

### Setting Default Version

To make v4 the default instead of v5:

```bash
# In insert-docs-versioned.sh, swap the default values:
- title: Account Kit v4
  slug: v4
  default: true     # ← Change from false to true

- title: Account Kit v5
  slug: v5
  default: false    # ← Change from true to false
```

## 🧹 Deprecating v4

When you're ready to remove v4 docs entirely:

1. **Update workflows** to use the old single-version setup:

   ```bash
   git mv .github/workflows/publish-fern-docs.yml.disabled \
          .github/workflows/publish-fern-docs.yml
   git rm .github/workflows/publish-fern-docs-versioned.yml
   ```

2. **Update setup-docs action** back to single version:

   ```yaml
   - name: Setup Docs
     uses: ./.github/actions/setup-docs
   ```

3. **Clean up scripts** (optional):
   ```bash
   git rm docs/scripts/insert-docs-versioned.sh
   git rm docs/scripts/docs-dev-versioned.sh
   ```

## 🐛 Troubleshooting

### Issue: "wallets directory not found"

**Cause**: The script is looking for a `wallets/` directory but finds `wallets-v4/` and `wallets-v5/`

**Solution**: Make sure you're using the correct script:

- For versioned: `insert-docs-versioned.sh`
- For single version: `insert-docs.sh`

### Issue: "Region not found" during code snippet extraction

**Cause**: Code snippet regions exist in one branch but not the other

**Solution**:

1. Check which branch is failing: `git log --oneline --graph`
2. Ensure the referenced code regions exist in both v4 and v5 branches
3. Or update the docs to reference regions that exist in both versions

### Issue: Duplicate content in navigation

**Cause**: Both the old and new navigation structures are present

**Solution**: Check that the awk script correctly replaces the wallets tab. Look for duplicate `- tab: wallets` entries in `fern/docs.yml`

### Issue: Images not loading

**Cause**: Images paths weren't updated for the versioned directories

**Solution**: The script should handle this automatically. If not, check that:

1. Images were copied to `fern/images/wallets/`
2. MDX files reference images with relative paths
3. Image paths in docs don't hardcode `/wallets/images/`

### Issue: Local dev shows "Port 3020 already in use"

**Solution**:

```bash
# Find and kill the process
lsof -ti:3020 | xargs kill -9

# Or use a different port (edit docs-dev-versioned.sh)
```

## 📝 Best Practices

1. **Test locally first** - Always test with `docs-dev-versioned.sh --dual` before deploying
2. **Keep branches in sync** - Regularly update main and v5 branches to avoid drift
3. **Consistent structure** - Keep similar navigation structure between v4 and v5 for better UX
4. **Document breaking changes** - When v5 has breaking changes, document them clearly
5. **Monitor build times** - Versioned builds take ~2x as long, monitor CI/CD performance

## 🔗 Related Documentation

- [Fern Tab Variants](https://buildwithfern.com/learn/docs/configuration/tabs#tab-variants)
- [VERSIONED_DOCS_EXAMPLE.md](./VERSIONED_DOCS_EXAMPLE.md) - Structure examples
- Original docs architecture documentation (in your context)

## ❓ FAQ

**Q: Can I have more than 2 versions?**
A: Yes! Just add more variants and adjust the script to handle additional branches.

**Q: Can I version individual pages instead of the whole tab?**
A: Not with this approach. Tab variants version the entire tab. For page-level versioning, you'd need a different strategy.

**Q: How do I preview just v5 without v4?**
A: Switch to your v5 branch and run the regular `docs-dev.sh` script (not the versioned one).

**Q: Will this work with the docs repo deployment pattern?**
A: The current implementation is for aa-sdk-triggered deploys. To support docs-repo-triggered deploys, you'd need to create a similar composite action in the docs repo.

## 🎯 Success Criteria

Before considering this complete, verify:

- ✅ Local dev works in both single and dual mode
- ✅ Preview builds successfully show both versions
- ✅ Production deployment works
- ✅ Both v4 and v5 code snippets are extracted correctly
- ✅ Navigation works smoothly between versions
- ✅ Images and assets load in both versions
- ✅ Search works across both versions (Fern handles this)
- ✅ URLs are clean (`.../wallets/v4/...` and `.../wallets/v5/...`)
