#!/bin/bash
# This script is exclusively used for running Fern docs locally

# Set error handling
set -e

# Get the absolute path to the project root
PROJECT_ROOT="$( cd "$( dirname "$0" )/../.." && pwd )"
DOCS_SITE_DIR="$PROJECT_ROOT/docs-site"

cleanup() {
    echo "Cleaning up..."
    cd "$DOCS_SITE_DIR"
    git restore .
    git clean -fdq
    cd "$PROJECT_ROOT"
    exit 0
}

# clean up changes to docs-site on script termination
trap cleanup SIGINT SIGTERM

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
cd "$DOCS_SITE_DIR"
pnpm i

# Start the docs site
pnpm dev
