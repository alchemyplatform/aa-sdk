#!/bin/bash
# This script is exclusively used for running Fern docs locally

# Set error handling
set -e

# check if user has pnpm installed
if ! command -v pnpm &> /dev/null; then
    echo "pnpm is required to run the docs site. Please run the following commands to configure pnpm:"
    echo "  asdf install # or \`mise install\`"
    echo "  corepack enable"
    exit 1
fi

# Update docs-site submodule
git submodule update --init --recursive

# Insert docs content into docs-site
./docs/scripts/insert-docs.sh aa-sdk

# Install dependencies
cd docs-site
pnpm i

# Start the docs site
pnpm dev
