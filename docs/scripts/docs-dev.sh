#!/bin/bash
# This script is exclusively used for running Fern docs locally

# Set error handling
set -e

# Get absolute paths
PROJECT_ROOT="$( cd "$( dirname "$0" )/../.." && pwd )"
DOCS_SITE_DIR="$PROJECT_ROOT/docs-site"
DOCS_DIR="$PROJECT_ROOT/docs"

cleanup() {
    echo "Exiting and cleaning up..."
    # Kill the onchange process if it exists
    if [ ! -z "$ONCHANGE_PID" ]; then
        kill $ONCHANGE_PID 2>/dev/null || true
    fi
    cd "$DOCS_SITE_DIR"
    git restore .
    git clean -fdq
    cd "$PROJECT_ROOT"
    exit 0
}
# Check if port 3020 is in use
if lsof -i :3020 > /dev/null; then
    echo "Port 3020 is already in use. Please free up the port and try again."
    exit 1
fi

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
git submodule update --init --recursive --remote docs-site/

cd "$DOCS_SITE_DIR"
# Install/update dependencies
pnpm i

# Insert docs content into docs-site
pnpm exec $DOCS_DIR/scripts/insert-docs.sh aa-sdk

# Start watching docs folder for changes in the background
pnpm exec onchange "$DOCS_DIR/**/*.mdx" "$DOCS_DIR/**/*.yml" -- sh -c "$DOCS_DIR/scripts/insert-docs.sh aa-sdk" &
ONCHANGE_PID=$!

# Start the docs site
cd "$DOCS_SITE_DIR"
pnpm dev || {
    echo "Fern local dev server failed to start"
    cleanup
    exit 1
}

# Catch-all to ensure cleanup is always run at termination
cleanup
