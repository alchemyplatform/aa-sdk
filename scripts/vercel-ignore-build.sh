#!/bin/bash

echo "🔍 Checking if build should be skipped..."

# Safe default - if anything goes wrong, build anyway
set +e  # Don't exit on error

# Always build main branch
if [ "$VERCEL_GIT_COMMIT_REF" == "main" ]; then
  echo "Building for main branch"
  exit 1
fi

# Only check PRs if we have the required variables
if [ -n "$VERCEL_GIT_PULL_REQUEST_ID" ] && [ -n "$GITHUB_TOKEN" ]; then
  echo "Checking PR #$VERCEL_GIT_PULL_REQUEST_ID"
  
  # Get PR info from GitHub API
  PR_BASE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/pulls/$VERCEL_GIT_PULL_REQUEST_ID" \
    | jq -r '.base.ref')
  
  # If we got a valid base branch
  if [ -n "$PR_BASE" ] && [ "$PR_BASE" != "null" ]; then
    echo "PR base branch: $PR_BASE"
    
    # Check if we should skip this branch
    SKIP_BRANCH="${SKIP_BUILD_FOR_BRANCH:-}"
    if [ -n "$SKIP_BRANCH" ] && [ "$PR_BASE" == "$SKIP_BRANCH" ]; then
      echo "🛑 Skipping build - PR targets $PR_BASE"
      exit 0  # Skip build
    fi
  else
    echo "⚠️ Could not get PR base branch"
  fi
fi

echo "✅ Proceeding with build"
exit 1  # Proceed with build