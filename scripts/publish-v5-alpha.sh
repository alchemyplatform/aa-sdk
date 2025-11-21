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

if [ "$CURRENT_BRANCH" != "$REQUIRED_BRANCH" ]; then
  echo -e "${RED}Error: V5 packages must be published from the '$REQUIRED_BRANCH' branch${NC}"
  echo -e "${RED}Current branch: $CURRENT_BRANCH${NC}"
  exit 1
fi

# Check for uncommitted changes (including untracked files)
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}Error: You have uncommitted changes (including untracked files). Please commit or stash them before publishing.${NC}"
  exit 1
fi

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
  echo -e "Previous publish may have been interrupted. Please restore manually:"
  echo -e "  mv lerna.json lerna-v5.json"
  echo -e "  mv lerna-v4.json.tmp lerna.json"
  exit 1
fi

mv lerna.json lerna-v4.json.tmp
mv lerna-v5.json lerna.json
echo -e "${GREEN}✓ V5 lerna config active${NC}\n"

# Cleanup function to restore lerna config on exit
cleanup() {
  if [ -f lerna-v4.json.tmp ]; then
    echo -e "\n${BLUE}Restoring original lerna config...${NC}"
    mv lerna.json lerna-v5.json
    mv lerna-v4.json.tmp lerna.json
    echo -e "${GREEN}✓ Original lerna config restored${NC}"
  fi
}
trap cleanup EXIT

if [ "$PUBLISH_MODE" = "dry-run" ]; then
  echo -e "${YELLOW}=== DRY RUN MODE - No packages will be published ===${NC}\n"

  echo -e "${BLUE}Changed packages:${NC}"
  npx lerna changed --long --json || echo "No changed packages"

  echo -e "\n${BLUE}Next version would be:${NC}"
  npx lerna version prerelease --preid alpha --no-push --no-git-tag-version --yes --dry-run || true

  echo -e "\n${YELLOW}=== To actually publish, run: ./scripts/publish-v5-alpha.sh publish ===${NC}"
  exit 0
fi

if [ "$PUBLISH_MODE" != "publish" ]; then
  echo -e "${RED}❌ ERROR: Invalid argument '$PUBLISH_MODE'${NC}"
  echo -e "Usage:"
  echo -e "  ./scripts/publish-v5-alpha.sh          # Dry run"
  echo -e "  ./scripts/publish-v5-alpha.sh publish  # Actually publish"
  exit 1
fi

# Get the next version that will be published
NEXT_VERSION=$(npx lerna version prerelease --preid alpha --no-push --no-git-tag-version --yes --dry-run 2>&1 | grep -oP "(?<==> ).*(?= \(currently)" | head -1 || echo "unknown")

# Prompt for confirmation
echo -e "${YELLOW}⚠️  Ready to publish V5 alpha packages${NC}"
if [ "$NEXT_VERSION" != "unknown" ]; then
  echo -e "${BLUE}Next version: ${GREEN}$NEXT_VERSION${NC}"
fi
read -p "Do you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Publish cancelled${NC}"
  cleanup
  exit 0
fi

# Actually publish
echo -e "${YELLOW}⚠️  PUBLISHING TO NPM...${NC}\n"

set +e  # Don't exit on error
npx lerna publish prerelease \
  --preid alpha \
  --dist-tag alpha \
  --force-publish \
  --no-private \
  --no-verify-access \
  --no-push \
  --no-git-tag-version \
  --yes
LERNA_EXIT=$?
set -e  # Re-enable exit on error

if [ $LERNA_EXIT -ne 0 ]; then
  echo -e "\n${YELLOW}⚠️  Lerna publish exited with code $LERNA_EXIT${NC}"
  echo -e "This may mean there are no changes to publish"
  exit $LERNA_EXIT
fi

echo -e "\n${GREEN}✓ Lerna publish completed successfully${NC}\n"

# Restore original lerna config before committing
cleanup
trap - EXIT  # Remove the trap since we're doing cleanup manually

# Get the new version from lerna-v5.json
NEW_VERSION=$(node -p "require('./lerna-v5.json').version")
echo -e "${BLUE}Published version: ${GREEN}$NEW_VERSION${NC}\n"

# Stage all changes (package.json files + both lerna configs)
git add packages/*/package.json lerna.json lerna-v5.json

# Check if there are actually changes to commit
if [ -z "$(git diff --cached --name-only)" ]; then
  echo -e "${YELLOW}No changes to commit - lerna found nothing to publish${NC}"
  exit 0
fi

# Create commit
echo -e "${BLUE}Creating commit...${NC}"
git commit -m "chore(v5): publish alpha version $NEW_VERSION [skip ci]"

echo -e "\n${GREEN}✓ Commit created${NC}\n"

# Prompt to push changes
read -p "Push changes to remote? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Pushing changes to remote...${NC}"
  git push
  echo -e "\n${GREEN}✓✓✓ V5 Alpha publish complete! ✓✓✓${NC}"
  echo -e "${GREEN}Published version $NEW_VERSION${NC}"
else
  echo -e "\n${GREEN}✓ V5 Alpha packages published to npm${NC}"
  echo -e "${GREEN}Published version $NEW_VERSION${NC}"
  echo -e "${YELLOW}Don't forget to push your changes: git push${NC}"
fi
