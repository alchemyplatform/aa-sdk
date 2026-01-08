#!/bin/bash
# This script copies SDK references from aa-sdk during Fern builds

# Set error handling
set -e

# Capture repo argument
REPO=$1

if [ ! -d "fern" ]; then
  echo "Error: fern directory not found"
  echo "This script must be executed from the docs root directory (or docs-site root if aa-sdk)"
  exit 1
fi

echo "🚀 Inserting SDK references from aa-sdk..."

# Clean up any existing SDK reference files from previous runs
rm -rf fern/wallets/pages/reference

# Create SDK reference directory
mkdir -p fern/wallets/pages/reference

if [ "$REPO" = "aa-sdk" ]; then
  # From aa-sdk repo, copy only the SDK reference files
  echo "📦 Copying SDK references from aa-sdk repo..."
  cp -r ../docs/pages/reference/* fern/wallets/pages/reference/
  
  # Also need the SDK Reference section from docs.yml
  cp ../docs/docs.yml /tmp/aa-sdk-docs.yml
else
  # From docs repo, need to access aa-sdk
  # Check if aa-sdk is available (via submodule or checkout)
  if [ ! -d "aa-sdk/docs" ]; then
    echo "Error: aa-sdk/docs not found. Ensure aa-sdk repo is checked out."
    exit 1
  fi
  
  echo "📦 Copying SDK references from aa-sdk checkout..."
  cp -r aa-sdk/docs/pages/reference/* fern/wallets/pages/reference/
  
  # Also need the SDK Reference section from aa-sdk docs.yml
  cp aa-sdk/docs/docs.yml /tmp/aa-sdk-docs.yml
fi

echo "✅ Copied SDK references"

# Create a backup of fern/docs.yml in case of error during insert
cp fern/docs.yml fern/docs.yml.bak

# Extract ONLY the SDK Reference section from aa-sdk docs.yml
# This is the section starting with "- section: SDK Reference" within the wallets tab
sed -n '/^      - section: SDK Reference/,/^      - section:/p' /tmp/aa-sdk-docs.yml | sed '$d' > /tmp/sdk_ref_section.yml

# If the sed didn't find a closing section (i.e., SDK Reference is the last section), try again
if [ ! -s /tmp/sdk_ref_section.yml ]; then
  sed -n '/^      - section: SDK Reference/,$p' /tmp/aa-sdk-docs.yml > /tmp/sdk_ref_section.yml
fi

# Find where to insert the SDK Reference section in the merged docs.yml
# It should go at the end of the wallets tab, before the Resources section
awk '
    BEGIN { 
        in_wallets = 0; 
        inserted = 0;
        # Read the SDK Reference section into a variable
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
        # Exiting wallets tab
        if (!inserted) {
            # Insert at end of wallets tab if Resources section not found
            printf "%s", sdk_ref;
        }
        in_wallets = 0;
        print;
        next;
    }
    { print; }
' fern/docs.yml > fern/docs.yml.tmp && mv fern/docs.yml.tmp fern/docs.yml

echo "✅ Merged SDK Reference section into docs.yml"

# Clean up temporary files
rm -f /tmp/sdk_ref_section.yml
rm -f /tmp/aa-sdk-docs.yml
rm -f fern/docs.yml.bak

echo "🎉 SDK references inserted successfully"
