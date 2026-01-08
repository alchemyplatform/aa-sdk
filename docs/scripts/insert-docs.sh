#!/bin/bash
# This script copies SDK references from aa-sdk during Fern builds
# Manual wallet content is now permanently in docs/fern/wallets
# This script ONLY handles SDK reference files and navigation

set -e

REPO=$1

if [ ! -d "fern" ]; then
  echo "Error: fern directory not found"
  echo "This script must be executed from the docs root directory (or docs-site root if aa-sdk)"
  exit 1
fi

echo "🚀 Inserting SDK references from aa-sdk..."

# Clean up any existing SDK reference files from previous runs
rm -rf fern/wallets/pages/reference

# Determine source paths based on which repo we're running from
if [ "$REPO" = "aa-sdk" ]; then
  SDK_REF_SOURCE="../docs/pages/reference"
  DOCS_YML_SOURCE="../docs/docs.yml"
else
  # From docs repo, aa-sdk should be checked out (submodule or git checkout action)
  if [ ! -d "aa-sdk/docs" ]; then
    echo "Error: aa-sdk/docs not found. Ensure aa-sdk repo is checked out."
    exit 1
  fi
  SDK_REF_SOURCE="aa-sdk/docs/pages/reference"
  DOCS_YML_SOURCE="aa-sdk/docs/docs.yml"
fi

# Copy SDK reference files
echo "📦 Copying SDK references..."
mkdir -p fern/wallets/pages/reference
cp -r "$SDK_REF_SOURCE"/* fern/wallets/pages/reference/
echo "✅ Copied SDK references"

# Extract SDK Reference section from aa-sdk docs.yml
# Since aa-sdk/docs/docs.yml now ONLY contains SDK Reference section, extract everything after "layout:"
echo "📝 Extracting SDK Reference navigation..."
sed -n '/^    layout:/,$p' "$DOCS_YML_SOURCE" | tail -n +2 > /tmp/sdk_ref_section.yml

# Insert SDK Reference section into main docs.yml before Resources section
echo "📝 Merging SDK Reference into docs.yml..."
awk '
    BEGIN { 
        in_wallets = 0; 
        inserted = 0;
        # Read the SDK Reference section
        while ((getline line < "/tmp/sdk_ref_section.yml") > 0) {
            sdk_ref = sdk_ref line "\n";
        }
        close("/tmp/sdk_ref_section.yml");
    }
    /^  - tab: wallets/ {
        in_wallets = 1;
        print;
        next;
    }
    in_wallets && /^      - section: Resources/ && !inserted {
        # Insert SDK Reference section before Resources
        printf "%s", sdk_ref;
        inserted = 1;
        print;
        next;
    }
    in_wallets && /^  - tab:/ {
        # Reached next tab - if not inserted yet, do it now
        if (!inserted) {
            printf "%s", sdk_ref;
        }
        in_wallets = 0;
        print;
        next;
    }
    { print; }
' fern/docs.yml > fern/docs.yml.tmp && mv fern/docs.yml.tmp fern/docs.yml

echo "✅ Merged SDK Reference section into docs.yml"

# Clean up
rm -f /tmp/sdk_ref_section.yml

echo "🎉 SDK references inserted successfully"
