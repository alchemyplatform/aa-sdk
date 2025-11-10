# Troubleshooting Versioned Docs

## 🐛 The Error You're Seeing

```
Failed to parse docs.yml because of Failed to parse because JSON schema validation failed
```

This means the generated `docs.yml` file has syntax errors or structure issues that Fern can't parse.

## 🔧 Fixes Applied

I've updated `insert-docs-versioned.sh` with:

1. **Better error checking** - Validates files exist before processing
2. **Improved path updates** - More careful regex to avoid double-replacing paths
3. **YAML validation** - Checks syntax before Fern tries to parse
4. **Support for missing wallets tab** - Handles docs-site that doesn't have wallets initially
5. **Verbose logging** - Shows exactly what step is running
6. **Backup & restore** - Automatically restores backup if validation fails

## 🧪 How to Test Again

### Step 1: Try running the script again

```bash
cd /Users/blake.duncan/Documents/workspace/aa-sdk
./docs/scripts/docs-dev-versioned.sh --dual
```

### Step 2: If it still fails, run the debug script

```bash
# After the script fails, don't kill it yet
# In another terminal:
cd /Users/blake.duncan/Documents/workspace/aa-sdk/docs-site
../docs/scripts/debug-versioned-docs.sh
```

This will show you:

- Which files exist/are missing
- Whether docs.yml is valid YAML
- The structure of the generated docs.yml
- Any leftover temp files

### Step 3: Check the specific error

The script now shows exactly where it fails:

- ❌ **"fern/wallets-v4/docs.yml not found"** → v4 branch checkout failed
- ❌ **"Failed to extract v4 navigation (file is empty)"** → docs.yml doesn't have expected structure
- ❌ **"docs.yml has YAML syntax errors"** → Generated YAML is malformed

## 🔍 Common Issues & Solutions

### Issue 1: Git Worktree Failed

**Symptom**: `fern/wallets-v4/docs.yml not found`

**Solution**:

```bash
# Check if main branch exists
git branch -a | grep main

# If not, fetch it
git fetch origin main

# Try again
./docs/scripts/docs-dev-versioned.sh --dual
```

### Issue 2: Docs Submodule Not Updated

**Symptom**: `fern directory not found`

**Solution**:

```bash
# Update the submodule
git submodule update --init --recursive --remote docs-site/

# Try again
./docs/scripts/docs-dev-versioned.sh --dual
```

### Issue 3: YAML Indentation Errors

**Symptom**: `docs.yml has YAML syntax errors`

**Solution**:

```bash
# Check the generated file
cd docs-site
cat fern/docs.yml | grep -A 20 "variants:"

# If it looks broken, restore backup and check the script
mv fern/docs.yml.bak fern/docs.yml

# Run with verbose output
cd ..
bash -x docs/scripts/insert-docs-versioned.sh aa-sdk /tmp/aa-sdk-v4/docs ./docs 2>&1 | tee debug.log
```

### Issue 4: Python Script Failed

**Symptom**: Script stops at "Updating paths for versioned directories"

**Solution**:

```bash
# Check Python3 is available
python3 --version

# Test the path update script manually
cd docs-site
python3 << 'TEST'
import re
with open('fern/docs.yml', 'r') as f:
    content = f.read()
    print("File loaded successfully")
    if 'Account Kit v4' in content:
        print("✅ Found v4 variant")
    if 'Account Kit v5' in content:
        print("✅ Found v5 variant")
TEST
```

### Issue 5: Fern Schema Validation Errors

**Symptom**: Fern says the schema is invalid even though YAML is valid

**Cause**: The variants structure doesn't match Fern's schema

**Solution**:

```bash
# Check Fern's documentation for variants
open https://buildwithfern.com/learn/docs/configuration/tabs#tab-variants

# Check your generated structure matches their examples
cd docs-site
grep -A 30 "variants:" fern/docs.yml
```

## 🆘 Emergency Restore

If everything is broken:

```bash
cd docs-site

# Restore from backup
if [ -f "fern/docs.yml.bak" ]; then
    mv fern/docs.yml.bak fern/docs.yml
    echo "✅ Restored backup"
fi

# Clean up versioned directories
rm -rf fern/wallets-v4 fern/wallets-v5

# Clean up git worktree
cd ..
git worktree remove /tmp/aa-sdk-v4 --force 2>/dev/null || true

# Reset submodule
cd docs-site
git restore .
git clean -fdq
```

## 📊 Debugging Checklist

Before asking for help, gather this information:

```bash
# 1. Check script version
head -5 docs/scripts/insert-docs-versioned.sh

# 2. Run debug script
cd docs-site
../docs/scripts/debug-versioned-docs.sh > debug-output.txt 2>&1

# 3. Check git status
cd ..
git status
git branch --show-current

# 4. Check for both branches
git log --oneline --graph --all | head -20

# 5. Try validation
cd docs-site
pip install pyyaml  # if not installed
python3 -c "import yaml; yaml.safe_load(open('fern/docs.yml'))"
```

## 💡 Pro Tips

1. **Start simple**: Test with single-version mode first

   ```bash
   ./docs/scripts/docs-dev-versioned.sh  # No --dual flag
   ```

2. **Check file permissions**: Make sure scripts are executable

   ```bash
   chmod +x docs/scripts/*.sh
   ```

3. **Watch for network issues**: Submodule updates need network access

   ```bash
   git submodule update --init --recursive --remote docs-site/
   ```

4. **Use PyYAML for validation**: Helps catch issues early

   ```bash
   pip install pyyaml
   ```

5. **Check Fern version**: Make sure you're on a compatible version
   ```bash
   cd docs-site && pnpm fern --version
   ```

## 📞 Still Stuck?

Share this information:

1. Output of `./docs/scripts/debug-versioned-docs.sh`
2. The error message from Fern
3. Last 50 lines of `fern/docs.yml`
4. Your git branch name
5. Whether single-version mode works

## 🎯 Next Steps After Fix

Once it works:

1. ✅ Test locally in dual mode
2. ✅ Commit the fixed scripts
3. ✅ Test in PR preview
4. ✅ Deploy to production

Good luck! 🚀
