#!/bin/bash
# This script runs Fern docs locally with versioned v4/v5 support
# 
# Usage:
#   ./docs-dev-versioned.sh              # Show only current branch's docs
#   ./docs-dev-versioned.sh --dual       # Show both v4 and v5 (requires clean git state)

# Set error handling
set -e

# Parse arguments
DUAL_VERSION=false
if [ "$1" = "--dual" ] || [ "$1" = "-d" ]; then
    DUAL_VERSION=true
fi

# Get absolute paths
PROJECT_ROOT="$( cd "$( dirname "$0" )/../.." && pwd )"
DOCS_SITE_DIR="$PROJECT_ROOT/docs-site"
DOCS_DIR="$PROJECT_ROOT/docs"
CURRENT_BRANCH=$(git branch --show-current)

cleanup() {
    echo "Exiting and cleaning up..."
    # Kill the onchange process if it exists
    if [ ! -z "$ONCHANGE_PID" ]; then
        kill $ONCHANGE_PID 2>/dev/null || true
    fi
    
    # Clean up git worktree if we created one
    if [ "$DUAL_VERSION" = true ]; then
        git worktree remove /tmp/aa-sdk-v4 --force 2>/dev/null || true
        rm -rf /tmp/aa-sdk-v4
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

if [ "$DUAL_VERSION" = true ]; then
    echo "🔄 Dual version mode: Setting up both v4 and v5 docs..."
    
    # Check for uncommitted changes (excluding submodules and untracked files)
    # We allow submodule changes since docs-site might have been modified during development
    # We also allow untracked files (like new scripts we're testing)
    
    # Get changed files, excluding docs-site submodule
    CHANGED_FILES=$(git diff --name-only HEAD | grep -v "^docs-site")
    
    if [ -n "$CHANGED_FILES" ]; then
        echo "❌ Error: You have uncommitted changes in the main repository."
        echo "   Please commit or stash them before running in dual version mode."
        echo ""
        echo "   Changed files:"
        echo "$CHANGED_FILES" | sed 's/^/   - /'
        echo ""
        echo "   Note: Changes in docs-site submodule and untracked files are allowed."
        exit 1
    fi
    
    # Clean up any stale worktree references first
    echo "🧹 Cleaning up any stale worktrees..."
    git worktree prune
    
    # Remove existing worktree if it exists
    if [ -d "/tmp/aa-sdk-v4" ]; then
        echo "   Removing existing /tmp/aa-sdk-v4 directory..."
        git worktree remove /tmp/aa-sdk-v4 --force 2>/dev/null || rm -rf /tmp/aa-sdk-v4
    fi
    
    # Create worktree for v4 (main branch)
    echo "📦 Checking out main branch for v4 docs..."
    cd "$PROJECT_ROOT"
    git fetch origin main
    
    if ! git worktree add /tmp/aa-sdk-v4 origin/main; then
        echo "❌ Failed to create worktree for v4"
        echo "   This could be due to:"
        echo "   - Network issues fetching origin/main"
        echo "   - Insufficient permissions on /tmp"
        echo "   - Stale worktree (try: git worktree prune)"
        cleanup
        exit 1
    fi
    
    # Verify the worktree was created
    if [ ! -d "/tmp/aa-sdk-v4" ]; then
        echo "❌ Worktree directory /tmp/aa-sdk-v4 was not created"
        cleanup
        exit 1
    fi
    
    if [ ! -f "/tmp/aa-sdk-v4/docs/scripts/extract-include-statements.js" ]; then
        echo "❌ v4 branch doesn't have expected docs structure"
        echo "   Expected: /tmp/aa-sdk-v4/docs/scripts/extract-include-statements.js"
        cleanup
        exit 1
    fi
    
    # Extract code snippets from v4
    echo "🔧 Extracting v4 code snippets..."
    cd /tmp/aa-sdk-v4
    if [ -f "docs/scripts/extract-include-statements.js" ]; then
        node docs/scripts/extract-include-statements.js
    fi
    
    # Extract code snippets from v5 (current branch)
    echo "🔧 Extracting v5 code snippets..."
    cd "$PROJECT_ROOT"
    if [ -f "docs/scripts/extract-include-statements.js" ]; then
        node docs/scripts/extract-include-statements.js
    fi
    
    # Insert both versions
    cd "$DOCS_SITE_DIR"
    echo "📝 Inserting versioned docs into docs-site..."
    
    if ! bash "$DOCS_DIR/scripts/insert-docs-versioned.sh" aa-sdk /tmp/aa-sdk-v4/docs "$DOCS_DIR"; then
        echo "❌ Failed to insert versioned docs"
        cleanup
        exit 1
    fi
    
    # Verify the versioned directories were created
    if [ ! -d "fern/wallets-v4" ] || [ ! -d "fern/wallets-v5" ]; then
        echo "❌ Versioned directories were not created"
        echo "   Expected: fern/wallets-v4/ and fern/wallets-v5/"
        echo ""
        echo "   Actual directories in fern/:"
        ls -la fern/ | grep wallets
        cleanup
        exit 1
    fi
    
    echo "✅ Both v4 and v5 docs are ready!"
    echo ""
    echo "⚠️  NOTE: Hot reload is limited in dual version mode."
    echo "   Changes to your current branch will be reflected, but v4 docs are static."
    echo ""
    
    # Start watching current branch docs folder for changes
    pnpm exec onchange "$DOCS_DIR/**/*.mdx" "$DOCS_DIR/**/*.yml" -- sh -c "
        echo '🔄 Change detected, rebuilding...'
        cd $PROJECT_ROOT && node docs/scripts/extract-include-statements.js
        cd $DOCS_SITE_DIR && bash $DOCS_DIR/scripts/insert-docs-versioned.sh aa-sdk /tmp/aa-sdk-v4/docs $DOCS_DIR
    " &
    ONCHANGE_PID=$!
    
else
    echo "📦 Single version mode: Showing only $CURRENT_BRANCH docs..."
    echo ""
    echo "💡 To see both v4 and v5 versions, run: $0 --dual"
    echo ""
    
    # Extract code snippets
    cd "$PROJECT_ROOT"
    if [ -f "docs/scripts/extract-include-statements.js" ]; then
        node docs/scripts/extract-include-statements.js
    fi
    
    # Insert docs content into docs-site using the standard script
    cd "$DOCS_SITE_DIR"
    bash "$DOCS_DIR/scripts/insert-docs.sh" aa-sdk
    
    # Start watching docs folder for changes in the background
    pnpm exec onchange "$DOCS_DIR/**/*.mdx" "$DOCS_DIR/**/*.yml" -- sh -c "
        cd $PROJECT_ROOT && node docs/scripts/extract-include-statements.js
        cd $DOCS_SITE_DIR && bash $DOCS_DIR/scripts/insert-docs.sh aa-sdk
    " &
    ONCHANGE_PID=$!
fi

# Start the docs site
cd "$DOCS_SITE_DIR"
pnpm dev || {
    echo "Fern local dev server failed to start"
    cleanup
    exit 1
}

# Catch-all to ensure cleanup is always run at termination
cleanup

