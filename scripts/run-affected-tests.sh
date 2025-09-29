#!/bin/bash
set -e

# Script to run tests only for packages affected by changes
# Used in CI to optimize test execution time

BASE_BRANCH="${1:-main}"
echo "Analyzing packages affected by changes from $BASE_BRANCH..."

# Use turbo dry-run to identify which packages need testing
# This includes both changed packages and their dependents
TURBO_OUTPUT=$(yarn turbo run test:run --filter="./packages/*" --filter="[origin/$BASE_BRANCH...HEAD]" --dry-run 2>&1)

# Extract directories of packages that have test:run tasks
# 1. Find lines like "@alchemy/package-name#test:run"
# 2. Look ahead to find the Directory line
# 3. Extract the directory path and remove the "packages/" prefix
AFFECTED_DIRS=$(echo "$TURBO_OUTPUT" | \
  grep -E "^@alchemy/.*#test:run$" -A 10 | \
  grep "Directory" | \
  sed 's/.*Directory.*= *//' | \
  sed 's/^packages\///' | \
  sort -u)

if [ -z "$AFFECTED_DIRS" ]; then
  echo "No package changes detected, skipping tests"
  exit 0
fi

echo "Affected packages that need testing:"
echo "$AFFECTED_DIRS" | sed 's/^/  - /'

# Build vitest --project flags
# Vitest project names use "alchemy/" prefix (except for "alchemy" itself)
PROJECT_FLAGS=""
for dir in $AFFECTED_DIRS; do
  if [ "$dir" = "alchemy" ]; then
    PROJECT_FLAGS="$PROJECT_FLAGS --project=alchemy"
  else
    PROJECT_FLAGS="$PROJECT_FLAGS --project=alchemy/$dir"
  fi
done

echo ""
echo "Running tests with: yarn vitest run$PROJECT_FLAGS"
echo ""

# Run tests for affected packages in a single vitest process
# This avoids port conflicts from multiple vitest instances
yarn vitest run $PROJECT_FLAGS
