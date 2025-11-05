#!/bin/bash
# Debug helper for versioned docs issues
# Run this from the docs-site directory after insert-docs-versioned.sh fails

echo "🔍 Debugging Versioned Docs Setup"
echo "=================================="
echo ""

# Check current directory
echo "📂 Current directory:"
pwd
echo ""

# Check for required directories
echo "📁 Checking directories:"
for dir in "fern" "fern/wallets-v4" "fern/wallets-v5" "fern/images/wallets"; do
    if [ -d "$dir" ]; then
        echo "   ✅ $dir exists"
        file_count=$(find "$dir" -type f | wc -l)
        echo "      ($file_count files)"
    else
        echo "   ❌ $dir missing"
    fi
done
echo ""

# Check for docs.yml files
echo "📄 Checking docs.yml files:"
for file in "fern/docs.yml" "fern/wallets-v4/docs.yml" "fern/wallets-v5/docs.yml"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo "   ✅ $file exists ($lines lines)"
        
        # Check if it has wallets tab
        if grep -q "^  - tab: wallets" "$file"; then
            echo "      Has wallets tab"
        else
            echo "      ⚠️  No wallets tab found"
        fi
    else
        echo "   ❌ $file missing"
    fi
done
echo ""

# Try to validate YAML if possible
echo "🔍 Validating YAML syntax:"
if command -v python3 &> /dev/null; then
    python3 << 'VALIDATE'
try:
    import yaml
    
    files = ['fern/docs.yml', 'fern/wallets-v4/docs.yml', 'fern/wallets-v5/docs.yml']
    for filepath in files:
        try:
            with open(filepath, 'r') as f:
                yaml.safe_load(f)
            print(f"   ✅ {filepath} is valid YAML")
        except FileNotFoundError:
            print(f"   ⚠️  {filepath} not found")
        except Exception as e:
            print(f"   ❌ {filepath} has errors:")
            print(f"      {str(e)[:100]}")
except ImportError:
    print("   ⚠️  PyYAML not installed - install with: pip install pyyaml")
VALIDATE
else
    echo "   ⚠️  Python3 not available"
fi
echo ""

# Check for backup files
echo "💾 Checking backup files:"
if [ -f "fern/docs.yml.bak" ]; then
    echo "   ✅ Backup exists: fern/docs.yml.bak"
    echo "      To restore: mv fern/docs.yml.bak fern/docs.yml"
else
    echo "   ⚠️  No backup found"
fi
echo ""

# Show last few lines of docs.yml to check structure
echo "📖 Last 30 lines of fern/docs.yml:"
echo "---"
if [ -f "fern/docs.yml" ]; then
    tail -30 fern/docs.yml
else
    echo "   ❌ fern/docs.yml not found"
fi
echo "---"
echo ""

# Check if variants exist in docs.yml
echo "🔍 Checking for tab variants in fern/docs.yml:"
if [ -f "fern/docs.yml" ]; then
    if grep -q "variants:" fern/docs.yml; then
        echo "   ✅ Found 'variants:' keyword"
        echo ""
        echo "   Variants section:"
        grep -A 5 "variants:" fern/docs.yml | head -20
    else
        echo "   ❌ No 'variants:' found - variants may not have been created"
    fi
else
    echo "   ❌ fern/docs.yml not found"
fi
echo ""

# Check temp files (might still exist if script failed)
echo "🗑️  Checking for leftover temp files:"
temp_count=0
for pattern in "fern/temp_*.yml" "fern/wallets-v*/temp_*.yml"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            echo "   Found: $file"
            ((temp_count++))
        fi
    done
done

if [ $temp_count -eq 0 ]; then
    echo "   ✅ No temp files found"
else
    echo "   ⚠️  Found $temp_count temp file(s) - script may have failed mid-execution"
fi
echo ""

echo "=================================="
echo "💡 Common Issues:"
echo ""
echo "1. If docs.yml.bak exists and docs.yml is broken:"
echo "   mv fern/docs.yml.bak fern/docs.yml"
echo ""
echo "2. If wallets-v4 or wallets-v5 directories are missing:"
echo "   Check that both branches were checked out correctly"
echo ""
echo "3. If YAML validation fails:"
echo "   Check for indentation issues in the variants section"
echo ""
echo "4. To see full error details, run Fern with debug:"
echo "   cd docs-site && pnpm fern generate --docs --log-level debug"
echo ""

