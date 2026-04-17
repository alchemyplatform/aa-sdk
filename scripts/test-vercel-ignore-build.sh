#!/bin/bash

# Simulate Vercel's automatic variables
export VERCEL_GIT_COMMIT_REF="bc/ci-filter" # replace with the branch you want to test
export VERCEL_GIT_PULL_REQUEST_ID="2111"  # replace with the PR you want to test
export VERCEL_GIT_REPO_OWNER="AlchemyPlatform"
export VERCEL_GIT_REPO_SLUG="aa-sdk" 

# Simulate the custom variables you'll add in Vercel dashboard
export GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"  # Replace with your actual GitHub token for testing
if [ "$GITHUB_TOKEN" = "YOUR_GITHUB_TOKEN_HERE" ]; then
  echo "Error: GITHUB_TOKEN is set to the placeholder value. Please replace it with your actual GitHub token." >&2
  exit 1
fi
export SKIP_BUILD_FOR_BRANCH="moldy/v5-base"

# Now run your actual script
echo "=== Running Vercel ignore script with simulated environment ==="
bash ./scripts/vercel-ignore-build.sh

# Check the exit code
if [ $? -eq 0 ]; then
  echo "Result: Would SKIP build ❌"
else
  echo "Result: Would BUILD ✅"
fi
