#!/bin/bash
# This script is used to insert the docs into the docs-site folder across both aa-sdk and docs repos
# It needs to be agnostic to both A) the repo it is running in and B) whether the env is local or in CI/CD

# Set error handling
set -e

# Capture repo argument
REPO=$1

if [ ! -d "fern" ]; then
  echo "Error: fern directory not found"
  echo "This script must be executed from the docs root directory (or docs-site root if aa-sdk)"
  exit 1
fi

# Clean up any existing files from previous runs
rm -rf fern/wallets
rm -rf fern/images/wallets

# Copy docs to docs-site
  mkdir -p fern/wallets
if [ "$REPO" = "aa-sdk" ]; then
  # From aa-sdk repo, the docs folder is in the root of the monorepo
  cp -r ../docs/* fern/wallets/
else
  # From docs repo, the docs folder is in the aa-sdk folder
  cp -r aa-sdk/docs/* fern/wallets
fi

# Copy specs and api-generators to correct place in docs-site
cp -r fern/wallets/specs/openrpc/* src/openrpc/alchemy
cp -r fern/wallets/specs/openapi/* src/openapi/
cp -r fern/wallets/api-generators/* fern/apis/

# Move images to the correct place in docs-site
mkdir -p fern/images/wallets
cp -r fern/wallets/images/* fern/images/wallets/
rm -rf fern/wallets/images

# Create a backup of fern/docs.yml in case of error during insert
cp fern/docs.yml fern/docs.yml.bak

# Extract the wallets section from aa-sdk version of docs.yml
sed -n '/^  - tab: wallets/,$p' fern/wallets/docs.yml > fern/wallets/temp_wallets.yml

# Replace the wallets section in the target file using awk.
awk '
    BEGIN { in_wallets = 0; printed = 0; }
    /^  - tab: wallets/ {
        in_wallets = 1;
        if (!printed) {
            system("cat fern/wallets/temp_wallets.yml");
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

# Clean up temporary files
rm -f fern/wallets/temp_wallets.yml
rm -f fern/docs.yml.bak
