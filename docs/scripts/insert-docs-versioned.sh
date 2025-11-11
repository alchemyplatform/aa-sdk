#!/bin/bash
# This script handles inserting docs from multiple versions/branches into the docs-site
# It creates a tab variant structure for v4 and v5 within the wallets tab

# Set error handling
set -e

# Capture arguments
REPO=$1           # "aa-sdk" or "docs"
V4_DOCS_PATH=$2   # Path to v4 docs directory
V5_DOCS_PATH=$3   # Path to v5 docs directory

# Validate we're in the right directory
if [ ! -d "fern" ]; then
  echo "Error: fern directory not found"
  echo "This script must be executed from the docs root directory (or docs-site root if aa-sdk)"
  exit 1
fi

# Validate required paths are provided
if [ -z "$V4_DOCS_PATH" ] || [ -z "$V5_DOCS_PATH" ]; then
  echo "❌ Error: Both v4 and v5 docs paths must be provided"
  echo "Usage: $0 <repo> <v4-docs-path> <v5-docs-path>"
  exit 1
fi

# Validate that the paths actually exist
if [ ! -d "$V4_DOCS_PATH" ]; then
  echo "❌ Error: V4 docs path does not exist: $V4_DOCS_PATH"
  exit 1
fi

if [ ! -d "$V5_DOCS_PATH" ]; then
  echo "❌ Error: V5 docs path does not exist: $V5_DOCS_PATH"
  exit 1
fi

echo "✅ Found v4 docs at: $V4_DOCS_PATH"
echo "✅ Found v5 docs at: $V5_DOCS_PATH"

# Clean up any existing files from previous runs
rm -rf fern/wallets-v4
rm -rf fern/wallets-v5
rm -rf fern/wallets  # Also remove old single wallets directory
rm -rf fern/images/wallets

echo "📦 Copying v4 docs from: $V4_DOCS_PATH"
echo "📦 Copying v5 docs from: $V5_DOCS_PATH"

# Copy v4 docs
mkdir -p fern/wallets-v4
cp -r "$V4_DOCS_PATH"/* fern/wallets-v4/

# Copy v5 docs
mkdir -p fern/wallets-v5
cp -r "$V5_DOCS_PATH"/* fern/wallets-v5/

# Copy specs and api-generators from v5 (assuming v5 is the canonical version for these)
# Create destination directories and guard against missing sources
mkdir -p src/openrpc/alchemy src/openapi fern/apis

if [ -d "fern/wallets-v5/specs/openrpc" ] && [ "$(ls -A fern/wallets-v5/specs/openrpc 2>/dev/null)" ]; then
  cp -r fern/wallets-v5/specs/openrpc/* src/openrpc/alchemy/ 2>/dev/null || true
fi

if [ -d "fern/wallets-v5/specs/openapi" ] && [ "$(ls -A fern/wallets-v5/specs/openapi 2>/dev/null)" ]; then
  cp -r fern/wallets-v5/specs/openapi/* src/openapi/ 2>/dev/null || true
fi

if [ -d "fern/wallets-v5/api-generators" ] && [ "$(ls -A fern/wallets-v5/api-generators 2>/dev/null)" ]; then
  cp -r fern/wallets-v5/api-generators/* fern/apis/ 2>/dev/null || true
fi

# Move images to a shared location
# Images from both versions go to the same place to avoid duplication
# MDX files reference images via /images/wallets/... (absolute from fern root)
mkdir -p fern/images/wallets
if [ -d "fern/wallets-v4/images" ]; then
  cp -r fern/wallets-v4/images/* fern/images/wallets/ 2>/dev/null || true
  rm -rf fern/wallets-v4/images
fi
if [ -d "fern/wallets-v5/images" ]; then
  cp -r fern/wallets-v5/images/* fern/images/wallets/ 2>/dev/null || true
  rm -rf fern/wallets-v5/images
fi
echo "📸 Moved images to shared location: fern/images/wallets/"

# Create a backup of fern/docs.yml
cp fern/docs.yml fern/docs.yml.bak

echo "🔧 Building tab variants structure..."

# Check that docs.yml files exist
if [ ! -f "fern/wallets-v4/docs.yml" ]; then
    echo "❌ Error: fern/wallets-v4/docs.yml not found"
    exit 1
fi

if [ ! -f "fern/wallets-v5/docs.yml" ]; then
    echo "❌ Error: fern/wallets-v5/docs.yml not found"
    exit 1
fi

# Extract the v4 wallets navigation layout
echo "   Extracting v4 navigation..."
# Use awk to extract from wallets tab to next tab (or end), excluding the next tab line
awk 'BEGIN{found=0} /^  - tab: wallets/{found=1} found{if(/^  - tab:/ && !/^  - tab: wallets/){exit} print}' fern/wallets-v4/docs.yml > fern/wallets-v4/temp_v4_nav.yml

# Extract the v5 wallets navigation layout  
echo "   Extracting v5 navigation..."
# Use awk to extract from wallets tab to next tab (or end), excluding the next tab line
awk 'BEGIN{found=0} /^  - tab: wallets/{found=1} found{if(/^  - tab:/ && !/^  - tab: wallets/){exit} print}' fern/wallets-v5/docs.yml > fern/wallets-v5/temp_v5_nav.yml

# Check that we extracted something
if [ ! -s "fern/wallets-v4/temp_v4_nav.yml" ]; then
    echo "❌ Error: Failed to extract v4 navigation (file is empty)"
    exit 1
fi

if [ ! -s "fern/wallets-v5/temp_v5_nav.yml" ]; then
    echo "❌ Error: Failed to extract v5 navigation (file is empty)"
    exit 1
fi

# Extract just the layout sections from each version
echo "   Extracting layout sections..."
sed -n '/^    layout:/,$p' fern/wallets-v4/temp_v4_nav.yml > fern/temp_v4_layout.yml
sed -n '/^    layout:/,$p' fern/wallets-v5/temp_v5_nav.yml > fern/temp_v5_layout.yml

# Verify we have layout content
if [ ! -s "fern/temp_v4_layout.yml" ]; then
    echo "❌ Error: Failed to extract v4 layout (file is empty)"
    exit 1
fi

if [ ! -s "fern/temp_v5_layout.yml" ]; then
    echo "❌ Error: Failed to extract v5 layout (file is empty)"
    exit 1
fi

# Create the tab variants structure
cat > fern/temp_wallets_variants.yml << 'EOF'
  - tab: wallets
    variants:
      - title: v4
        slug: v4
        default: false
        layout:
EOF

# Add v4 layout (remove the "layout:" line and adjust indentation)
# Also add "collapsed: false" to top-level sections so they display expanded by default
sed 's/^    layout://' fern/temp_v4_layout.yml | awk '
  /^      - section:/ {
    # This is a top-level section, print it and add collapsed: false
    section_line = $0
    # Read ahead to check what comes next
    getline next_line
    # Print the section line
    print section_line
    # Add collapsed: false at the right indent level (8 spaces to match other properties)
    print "        collapsed: false"
    # Print the next line (skip-slug, slug, or contents)
    print next_line
    next
  }
  { print }
' | sed 's/^    /          /' >> fern/temp_wallets_variants.yml

# Add v5 variant
cat >> fern/temp_wallets_variants.yml << 'EOF'
      - title: v5
        slug: v5
        default: true
        layout:
EOF

# Add v5 layout (remove the "layout:" line and adjust indentation)
sed 's/^    layout://' fern/temp_v5_layout.yml | sed 's/^    /          /' >> fern/temp_wallets_variants.yml

# Replace the wallets tab in docs.yml with the new variants structure
echo "   Merging into main docs.yml..."

# Check if wallets tab exists in main docs.yml
if grep -q "^  - tab: wallets" fern/docs.yml; then
    echo "   Found existing wallets tab, replacing it..."
    # Replace existing wallets tab
    awk '
        BEGIN { in_wallets = 0; printed = 0; }
        /^  - tab: wallets/ {
            in_wallets = 1;
            if (!printed) {
                system("cat fern/temp_wallets_variants.yml");
                printed = 1;
            }
            next;
        }
        /^  - tab:/ {
            if (in_wallets) {
                in_wallets = 0;
            }
            print;
            next;
        }
        !in_wallets {
            print;
        }
    ' fern/docs.yml > fern/docs.yml.tmp && mv fern/docs.yml.tmp fern/docs.yml
else
    echo "   No existing wallets tab found, inserting before rollups tab..."
    # Insert wallets tab before rollups tab (after data)
    awk '
        /^  - tab: rollups/ {
            # Insert wallets tab before rollups
            system("cat fern/temp_wallets_variants.yml");
            print;
            next;
        }
        { print; }
    ' fern/docs.yml > fern/docs.yml.tmp && mv fern/docs.yml.tmp fern/docs.yml
fi

# Handle mdx-components from both versions
echo "🔧 Merging MDX components..."

# Extract mdx-components from both versions
sed -n '/^  mdx-components:/,/^  [a-z]/p' fern/wallets-v4/docs.yml | sed '$d' | grep '^    -' > fern/temp_mdx_v4.yml 2>/dev/null || touch fern/temp_mdx_v4.yml
sed -n '/^  mdx-components:/,/^  [a-z]/p' fern/wallets-v5/docs.yml | sed '$d' | grep '^    -' > fern/temp_mdx_v5.yml 2>/dev/null || touch fern/temp_mdx_v5.yml

# Combine and deduplicate MDX components
cat fern/temp_mdx_v4.yml fern/temp_mdx_v5.yml | sort -u > fern/temp_mdx_combined.yml

# Insert combined MDX components into docs.yml
awk '
    BEGIN { in_mdx = 0; }
    /^  mdx-components:/ {
        in_mdx = 1;
        print;
        next;
    }
    in_mdx && /^    - / {
        # Skip existing component items, we will add our own
        next;
    }
    in_mdx && !/^    / {
        # We are no longer in component items
        # Insert new components before this line
        system("cat fern/temp_mdx_combined.yml");
        in_mdx = 0;
        print;
        next;
    }
    { print; }
    END {
        if (in_mdx) {
            system("cat fern/temp_mdx_combined.yml");
        }
    }
' fern/docs.yml > fern/docs.yml.tmp && mv fern/docs.yml.tmp fern/docs.yml

# Update paths in docs.yml to reference the versioned directories
echo "🔧 Updating paths for versioned directories..."

# Use Python to carefully update paths in each variant section
python3 << 'PYTHON_SCRIPT'
import re

try:
    with open('fern/docs.yml', 'r') as f:
        content = f.read()
except FileNotFoundError:
    print("❌ Error: fern/docs.yml not found")
    exit(1)

# Find the v4 variant section and v5 variant section
# Replace paths in v4 section  
v4_pattern = r'(- title: v4.*?)(- title: v5)'
v5_pattern = r'(- title: v5.*?)(\n  - tab:|\Z)'

def rewrite_variant_paths(section, variant_prefix):
    """Rewrite ANY path starting with 'wallets/' to use the variant prefix"""
    # Single-line paths: path: wallets/...
    section = re.sub(r'(?m)^(\s*path:\s*)wallets/', r'\1' + variant_prefix + '/', section)
    # Multi-line/folded paths: path: >-\n    wallets/...
    section = re.sub(r'(?ms)(path:\s*>-\s*\n)(\s*)wallets/', r'\1\2' + variant_prefix + '/', section)
    return section

def replace_v4_paths(match):
    v4_section = rewrite_variant_paths(match.group(1), 'wallets-v4')
    return v4_section + match.group(2)

def replace_v5_paths(match):
    v5_section = rewrite_variant_paths(match.group(1), 'wallets-v5')
    return v5_section + match.group(2)

# Apply replacements
content = re.sub(v4_pattern, replace_v4_paths, content, flags=re.DOTALL)
content = re.sub(v5_pattern, replace_v5_paths, content, flags=re.DOTALL)

# Also update mdx-components if they reference wallets (outside the variants sections)
# This is in the global mdx-components section at the top of the file
if 'wallets/components' in content:
    # Point to v5 components (or we could duplicate them for both versions)
    content = re.sub(r'- wallets/components', '- wallets-v5/components', content)

with open('fern/docs.yml', 'w') as f:
    f.write(content)

print("✅ Updated paths in docs.yml")
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Failed to update paths"
    exit 1
fi

echo ""
echo "🔍 Validating generated docs.yml..."

# Basic YAML validation using Python
python3 << 'VALIDATE_SCRIPT'
import sys
try:
    import yaml
    with open('fern/docs.yml', 'r') as f:
        yaml.safe_load(f)
    print("✅ docs.yml is valid YAML")
    sys.exit(0)
except ImportError:
    # PyYAML not available, skip validation
    print("⚠️  PyYAML not installed, skipping YAML validation")
    sys.exit(0)
except Exception as e:
    print(f"❌ docs.yml has YAML syntax errors: {e}")
    sys.exit(1)
VALIDATE_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Generated docs.yml is invalid. Restoring backup..."
    mv -f fern/docs.yml.bak fern/docs.yml
    exit 1
fi

# Validation succeeded - clean up temporary files
rm -f fern/wallets-v4/temp_v4_nav.yml
rm -f fern/wallets-v5/temp_v5_nav.yml
rm -f fern/temp_v4_layout.yml
rm -f fern/temp_v5_layout.yml
rm -f fern/temp_wallets_variants.yml
rm -f fern/temp_mdx_v4.yml
rm -f fern/temp_mdx_v5.yml
rm -f fern/temp_mdx_combined.yml
rm -f fern/docs.yml.bak

echo ""
echo "✅ Successfully inserted versioned docs with tab variants!"
echo "   - v4 docs: fern/wallets-v4/"
echo "   - v5 docs: fern/wallets-v5/"
echo "   - Tab variants created in fern/docs.yml"
echo ""
echo "💡 Tip: Check fern/docs.yml to review the generated structure"

