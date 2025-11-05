#!/bin/bash
# Validation script for versioned docs setup
# This script checks that everything is configured correctly

set -e

echo "🔍 Validating Versioned Docs Setup..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# Get project root
PROJECT_ROOT="$( cd "$( dirname "$0" )/../.." && pwd )"
cd "$PROJECT_ROOT"

echo "📂 Project root: $PROJECT_ROOT"
echo ""

# Check required files exist
echo "1️⃣  Checking required files..."
echo ""

if [ -f "docs/scripts/insert-docs-versioned.sh" ]; then
    check_pass "insert-docs-versioned.sh exists"
else
    check_fail "insert-docs-versioned.sh not found"
fi

if [ -x "docs/scripts/insert-docs-versioned.sh" ]; then
    check_pass "insert-docs-versioned.sh is executable"
else
    check_fail "insert-docs-versioned.sh is not executable"
fi

if [ -f ".github/actions/setup-docs-versioned/action.yml" ]; then
    check_pass "setup-docs-versioned action exists"
else
    check_fail "setup-docs-versioned action not found"
fi

if [ -f "docs/scripts/docs-dev-versioned.sh" ]; then
    check_pass "docs-dev-versioned.sh exists"
else
    check_fail "docs-dev-versioned.sh not found"
fi

if [ -x "docs/scripts/docs-dev-versioned.sh" ]; then
    check_pass "docs-dev-versioned.sh is executable"
else
    check_fail "docs-dev-versioned.sh is not executable"
fi

echo ""
echo "2️⃣  Checking branch structure..."
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "   Current branch: $CURRENT_BRANCH"

# Check if main branch exists
if git show-ref --verify --quiet refs/heads/main; then
    check_pass "main branch exists (for v4 docs)"
elif git show-ref --verify --quiet refs/remotes/origin/main; then
    check_pass "origin/main exists (for v4 docs)"
else
    check_fail "main branch not found - needed for v4 docs"
fi

# Check if docs directory exists
if [ -d "docs" ]; then
    check_pass "docs directory exists"
else
    check_fail "docs directory not found"
fi

# Check if docs.yml exists
if [ -f "docs/docs.yml" ]; then
    check_pass "docs/docs.yml exists"
else
    check_fail "docs/docs.yml not found"
fi

echo ""
echo "3️⃣  Checking documentation structure..."
echo ""

# Check for wallets tab in docs.yml
if grep -q "- tab: wallets" docs/docs.yml; then
    check_pass "Wallets tab found in docs.yml"
else
    check_fail "Wallets tab not found in docs.yml"
fi

# Check for docs pages
if [ -d "docs/pages" ]; then
    PAGE_COUNT=$(find docs/pages -name "*.mdx" | wc -l)
    check_pass "Found $PAGE_COUNT MDX pages in docs/pages"
else
    check_fail "docs/pages directory not found"
fi

echo ""
echo "4️⃣  Checking git submodule..."
echo ""

# Check if docs-site submodule exists
if [ -d "docs-site" ]; then
    check_pass "docs-site submodule directory exists"
    
    if [ -d "docs-site/fern" ]; then
        check_pass "docs-site/fern directory exists"
    else
        check_warn "docs-site/fern not found - run 'git submodule update --init'"
    fi
else
    check_fail "docs-site submodule not found"
fi

echo ""
echo "5️⃣  Checking workflow files..."
echo ""

if [ -f ".github/workflows/publish-fern-docs-versioned.yml.example" ]; then
    check_pass "Example publish workflow exists"
else
    check_warn "Example publish workflow not found"
fi

if [ -f ".github/workflows/preview-fern-docs-versioned.yml.example" ]; then
    check_pass "Example preview workflow exists"
else
    check_warn "Example preview workflow not found"
fi

# Check if old workflows are still active
if [ -f ".github/workflows/publish-fern-docs.yml" ]; then
    check_warn "Old publish-fern-docs.yml still active (you may want to disable it)"
fi

if [ -f ".github/workflows/preview-fern-docs.yml" ]; then
    check_warn "Old preview-fern-docs.yml still active (you may want to disable it)"
fi

echo ""
echo "6️⃣  Checking dependencies..."
echo ""

# Check for node
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js installed ($NODE_VERSION)"
else
    check_fail "Node.js not found"
fi

# Check for pnpm (needed for local dev)
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    check_pass "pnpm installed ($PNPM_VERSION)"
else
    check_warn "pnpm not found - needed for local dev"
fi

# Check for python3 (used in insert-docs-versioned.sh)
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    check_pass "Python 3 installed ($PYTHON_VERSION)"
else
    check_fail "Python 3 not found - needed by insert-docs-versioned.sh"
fi

echo ""
echo "7️⃣  Testing script syntax..."
echo ""

# Test bash script syntax
if bash -n docs/scripts/insert-docs-versioned.sh 2>/dev/null; then
    check_pass "insert-docs-versioned.sh syntax is valid"
else
    check_fail "insert-docs-versioned.sh has syntax errors"
fi

if bash -n docs/scripts/docs-dev-versioned.sh 2>/dev/null; then
    check_pass "docs-dev-versioned.sh syntax is valid"
else
    check_fail "docs-dev-versioned.sh has syntax errors"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Results:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Validation complete! Setup looks good.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Test locally: ./docs/scripts/docs-dev-versioned.sh --dual"
    echo "  2. Review implementation guide: docs/scripts/VERSIONED_DOCS_IMPLEMENTATION_GUIDE.md"
    echo "  3. Create a test PR to validate the preview workflow"
    exit 0
else
    echo -e "${RED}❌ Validation failed. Please fix the issues above.${NC}"
    exit 1
fi

