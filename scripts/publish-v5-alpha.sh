#!/bin/bash
set -e

# V5 Package Publishing Script
# This script publishes v5 packages from the packages/ directory as alpha releases
# Must be run from the moldy/v5-base branch
#
# Usage:
#   ./scripts/publish-v5-alpha.sh          # Dry run (shows what would be published)
#   ./scripts/publish-v5-alpha.sh publish  # Actually publish to npm

PUBLISH_MODE=${1:-"dry-run"}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== V5 Alpha Publishing Script ===${NC}\n"

# Check if we're running from the repo root
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
  echo -e "${RED}Error: run this script from the repo root (where package.json and packages/ live).${NC}"
  exit 1
fi

# Check if we're on the correct branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
REQUIRED_BRANCH="moldy/v5-base"

# TODO(jh): enable this after testing the rest.
# if [ "$CURRENT_BRANCH" != "$REQUIRED_BRANCH" ]; then
#   echo -e "${RED}Error: V5 packages must be published from the '$REQUIRED_BRANCH' branch${NC}"
#   echo -e "${RED}Current branch: $CURRENT_BRANCH${NC}"
#   exit 1
# fi

# TODO(jh): enable this after testing the rest.
# Check for uncommitted changes (including untracked files)
# if [ -n "$(git status --porcelain)" ]; then
#   echo -e "${RED}Error: You have uncommitted changes (including untracked files). Please commit or stash them before publishing.${NC}"
#   exit 1
# fi

# Check npm authentication
if ! npm whoami &> /dev/null; then
  echo -e "${RED}Error: You are not logged into npm. Run 'npm login' first.${NC}"
  exit 1
fi
NPM_USER=$(npm whoami)
echo -e "${GREEN}Logged into npm as: $NPM_USER${NC}\n"

# Build packages
echo -e "${BLUE}Building V5 packages...${NC}"
yarn build:libs
echo -e "${GREEN}✓ Build complete${NC}\n"

# Swap to v5 lerna config temporarily
echo -e "${BLUE}Setting up V5 lerna config...${NC}"
if [ -f lerna-v4.json.tmp ]; then
  echo -e "${RED}❌ ERROR: lerna-v4.json.tmp already exists${NC}"
  echo -e "Previous publish may have been interrupted. Please restore manually."
  exit 1
fi

mv lerna.json lerna-v4.json.tmp
mv lerna-v5.json lerna.json
echo -e "${GREEN}✓ V5 lerna config active${NC}\n"

if [ "$PUBLISH_MODE" = "dry-run" ]; then
  echo -e "${YELLOW}=== DRY RUN MODE - No packages will be published ===${NC}\n"

  echo -e "${BLUE}Changed packages:${NC}"
  npx lerna changed --long --json || echo "No changed packages"

  echo -e "\n${YELLOW}=== To actually publish, run: ./scripts/publish-v5-alpha.sh publish ===${NC}"

  # Restore lerna config files
  mv lerna.json lerna-v5.json
  mv lerna-v4.json.tmp lerna.json

  exit 0
fi

if [ "$PUBLISH_MODE" != "publish" ]; then
  echo -e "${RED}❌ ERROR: Invalid argument '$PUBLISH_MODE'${NC}"
  echo -e "Usage:"
  echo -e "  ./scripts/publish-v5-alpha.sh          # Dry run"
  echo -e "  ./scripts/publish-v5-alpha.sh publish  # Actually publish"
  exit 1
fi

# Prompt for new version
echo -e "${YELLOW}Enter the new alpha version to publish (must begin with '0.0.0-alpha.0'):${NC}"
read -p "Version: " NEW_VERSION

# Validate version starts with "0.0.0-alpha."
if [[ ! "$NEW_VERSION" =~ ^0\.0\.0-alpha\. ]]; then
  echo -e "${RED}❌ ERROR: Version must start with '0.0.0-alpha.' (e.g., 0.0.0-alpha.0)${NC}"
  exit 1
fi

# Confirm publishing
echo -e "\n${YELLOW}⚠️  Ready to publish V5 alpha packages${NC}"
echo -e "${BLUE}New version: ${GREEN}$NEW_VERSION${NC}"
read -p "Do you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Publish cancelled${NC}"
  exit 0
fi

# Temporarily update versions for publishing (without committing)
echo -e "${BLUE}Temporarily updating package versions for publishing...${NC}"

# Update lerna.json (currently pointing to v5 config) temporarily
node -e "\
  const fs = require('fs');\
  const lerna = JSON.parse(fs.readFileSync('lerna.json', 'utf8'));\
  lerna.version = '$NEW_VERSION';\
  fs.writeFileSync('lerna.json', JSON.stringify(lerna, null, 2) + '\n');\
"

# Use lerna version to update all package.json files temporarily
echo -e "${BLUE}Updating package.json files...${NC}"
set +e  # Don't exit on lerna errors
npx lerna version $NEW_VERSION --no-push --no-git-tag-version --yes --force-publish --exact --no-private --ignore-scripts
LERNA_VERSION_EXIT=$?
set -e

if [ $LERNA_VERSION_EXIT -ne 0 ]; then
  echo -e "${RED}❌ Failed to update package versions${NC}"
  exit $LERNA_VERSION_EXIT
fi

echo -e "${GREEN}✓ Versions updated${NC}\n"

# Commit changes temporarily (lerna publish requires clean working tree)
echo -e "${BLUE}Creating temporary commit...${NC}"
git add -A
git commit -m "chore: temp commit for v5 alpha publish (will be reverted)" --no-verify
echo -e "${GREEN}✓ Temporary commit created${NC}\n"

# Actually publish
echo -e "${YELLOW}⚠️  PUBLISHING TO NPM AS PRIVATE PACKAGES...${NC}\n"

set +e  # Don't exit on error
npx lerna publish from-package --dist-tag alpha --no-verify-access --ignore-scripts
LERNA_EXIT=$?
set -e  # Re-enable exit on error

if [ $LERNA_EXIT -ne 0 ]; then
  echo -e "${RED}❌ Lerna publish failed with code $LERNA_EXIT${NC}"
  exit $LERNA_EXIT
fi

# Restore repository state by removing the temporary commit
echo -e "\n${BLUE}Restoring repository state...${NC}"
git reset --hard HEAD~1
rm -f lerna-v4.json.tmp
echo -e "${GREEN}✓ Repository restored (temporary commit removed)${NC}"

echo -e "\n${GREEN}✓✓✓ V5 Alpha publish complete! ✓✓✓${NC}"
echo -e "${GREEN}Published version $NEW_VERSION to npm (private, alpha tag)${NC}"
echo -e "${YELLOW}(No version changes committed to repo)${NC}"
