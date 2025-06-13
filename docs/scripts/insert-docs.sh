#!/bin/bash

# Set error handling
set -e

# Capture repo argument
REPO=$1

# If the repo is aa-sdk, we need to cd into the docs-site folder
if [ "$REPO" = "aa-sdk" ]; then
  cd docs-site
fi

# Clean up any existing files from previous runs
rm -rf fern/wallets
rm -rf fern/images/wallets

# Copy docs to docs-site
  mkdir -p fern/wallets
if [ "$REPO" = "aa-sdk" ]; then
  # From aa-sdk repo, the docs folder is in the root of the repo
  cp -r ../docs/* fern/wallets/
else
  # From docs repo, the docs folder is in the aa-sdk folder
  cp -r aa-sdk/docs/* fern/wallets
fi

# Copy specs and api-generators to correct place in docs-site
if [ -d "fern/wallets/specs" ]; then
  cp -r fern/wallets/specs/openrpc/* src/openrpc/alchemy
  cp -r fern/wallets/specs/openapi/* src/openapi/
fi
if [ -d "fern/wallets/api-generators" ]; then
  cp -r fern/wallets/api-generators/* fern/apis/
fi

# Move images to the correct place in docs-site
if [ -d "fern/wallets/images" ]; then
    mkdir -p fern/images/wallets
    cp -r fern/wallets/images/* fern/images/wallets/
    rm -rf fern/wallets/images
fi

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

if [ "$REPO" = "aa-sdk" ]; then
  cd ..
fi
