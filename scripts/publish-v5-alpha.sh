#!/bin/bash

# V5 Package Publishing Script
# This script publishes v5 packages from the packages/ directory as alpha releases
# Must be run from the moldy/v5-base branch

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Packages to publish
PACKAGES_TO_PUBLISH=("aa-infra" "alchemy" "common" "smart-accounts")

# Check if we're running from the repo root
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
  echo -e "${RED}Error: run this script from the repo root (where package.json and packages/ live).${NC}"
  exit 1
fi

# Check if we're on the correct branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
REQUIRED_BRANCH="moldy/v5-base"

if [ "$CURRENT_BRANCH" != "$REQUIRED_BRANCH" ]; then
  echo -e "${RED}Error: V5 packages must be published from the '$REQUIRED_BRANCH' branch${NC}"
  echo -e "${RED}Current branch: $CURRENT_BRANCH${NC}"
  exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}Error: You have uncommitted changes (including untracked files). Please commit or stash them before publishing.${NC}"
  exit 1
fi

# Verify all packages exist
echo -e "${YELLOW}Validating packages...${NC}"
for pkg in "${PACKAGES_TO_PUBLISH[@]}"; do
  if [ ! -f "packages/$pkg/package.json" ]; then
    echo -e "${RED}Error: Package 'packages/$pkg' does not exist${NC}"
    exit 1
  fi
  PACKAGE_NAME=$(node -p "require('./packages/$pkg/package.json').name")
  echo "  ✓ $PACKAGE_NAME"
done

# Check npm authentication
if ! npm whoami &> /dev/null; then
  echo -e "${RED}Error: You are not logged into npm. Run 'npm login' first.${NC}"
  exit 1
fi
NPM_USER=$(npm whoami)
echo -e "${GREEN}Logged into npm as: $NPM_USER${NC}"

# Build all packages first (before any version changes)
echo -e "${YELLOW}Building packages...${NC}"
yarn build:libs

# Get the current alpha version or set initial version
echo -e "${YELLOW}Determining next alpha version...${NC}"

# Get the first package to check the current version
FIRST_PACKAGE="packages/${PACKAGES_TO_PUBLISH[0]}/package.json"
CURRENT_VERSION=$(node -p "require('./$FIRST_PACKAGE').version")

# If version is 0.0.0, start with 0.0.1-alpha.0
if [ "$CURRENT_VERSION" == "0.0.0" ]; then
  NEW_VERSION="0.0.1-alpha.0"
else
  # Extract the alpha number and increment it
  if [[ $CURRENT_VERSION =~ ^([0-9]+\.[0-9]+\.[0-9]+)-alpha\.([0-9]+)$ ]]; then
    BASE_VERSION="${BASH_REMATCH[1]}"
    ALPHA_NUM="${BASH_REMATCH[2]}"
    NEW_ALPHA_NUM=$((ALPHA_NUM + 1))
    NEW_VERSION="$BASE_VERSION-alpha.$NEW_ALPHA_NUM"
  else
    # If current version doesn't have alpha, add alpha.0
    NEW_VERSION="$CURRENT_VERSION-alpha.0"
  fi
fi

echo -e "${GREEN}Current version: $CURRENT_VERSION${NC}"
echo -e "${GREEN}New version: $NEW_VERSION${NC}"

# Prompt for confirmation
read -p "Do you want to publish v5 packages as version $NEW_VERSION? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Publish cancelled${NC}"
  exit 0
fi

# Update version in selected package.json files
echo -e "${YELLOW}Updating package versions...${NC}"
for pkg in "${PACKAGES_TO_PUBLISH[@]}"; do
  PACKAGE_NAME=$(node -p "require('./packages/$pkg/package.json').name")
  echo "  - $PACKAGE_NAME"

  # Update the version in package.json using a separate script file to avoid shell interpolation issues
  node -e "
    const fs = require('fs');
    const path = process.argv[1];
    const newVersion = process.argv[2];

    const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
    pkg.version = newVersion;

    // Update dependencies that reference other v5 packages
    const internalPackages = [
      '@alchemy/aa-infra',
      '@alchemy/common',
      '@alchemy/smart-accounts',
      '@alchemy/alchemy',
    ];

    for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
      if (!pkg[section]) continue;
      for (const dep of internalPackages) {
        if (pkg[section][dep]) {
          pkg[section][dep] = newVersion;
        }
      }
    }

    fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
  " "packages/$pkg/package.json" "$NEW_VERSION"
done

# Publish each package
echo -e "${YELLOW}Publishing packages...${NC}"
PUBLISHED_PACKAGES=()
for pkg in "${PACKAGES_TO_PUBLISH[@]}"; do
  PACKAGE_NAME=$(node -p "require('./packages/$pkg/package.json').name")
  echo -e "${GREEN}Publishing $PACKAGE_NAME@$NEW_VERSION${NC}"

  # Use pushd/popd instead of cd to be safer
  if ! (cd "packages/$pkg" && npm publish --tag alpha --access public); then
    echo -e "${RED}Error: Failed to publish $PACKAGE_NAME${NC}"
    echo -e "${RED}Rolling back version changes...${NC}"
    git checkout -- packages/*/package.json
    echo -e "${YELLOW}Published packages before failure: ${PUBLISHED_PACKAGES[*]}${NC}"
    echo -e "${YELLOW}You may need to unpublish these packages manually${NC}"
    exit 1
  fi

  PUBLISHED_PACKAGES+=("$PACKAGE_NAME")
done

# Commit the version changes
echo -e "${YELLOW}Committing version changes...${NC}"
for pkg in "${PACKAGES_TO_PUBLISH[@]}"; do
  git add "packages/$pkg/package.json"
done
git commit -m "chore(v5): publish alpha version $NEW_VERSION [skip-ci]"

echo -e "${GREEN}✓ Successfully published v5 packages as $NEW_VERSION${NC}"
echo -e "${YELLOW}Don't forget to push your changes: git push${NC}"
