#!/bin/bash

echo "🔍 Checking if build should be skipped..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Environment variables:"
echo "  VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"
echo "  VERCEL_GIT_PULL_REQUEST_ID: $VERCEL_GIT_PULL_REQUEST_ID"
echo "  VERCEL_GIT_REPO_OWNER: $VERCEL_GIT_REPO_OWNER"
echo "  VERCEL_GIT_REPO_SLUG: $VERCEL_GIT_REPO_SLUG"
echo "  SKIP_BUILD_FOR_BRANCH: ${SKIP_BUILD_FOR_BRANCH:-"Not set"}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Safe default - if anything goes wrong, build anyway
set +e  # Don't exit on error

# Always build main branch
if [ "$VERCEL_GIT_COMMIT_REF" == "main" ]; then
  echo "➜ Building for main branch"
  exit 1
fi

# Only check PRs if we have the required variables
if [ -n "$VERCEL_GIT_PULL_REQUEST_ID" ] && [ -n "$GITHUB_TOKEN" ]; then
  echo "➜ Checking PR #$VERCEL_GIT_PULL_REQUEST_ID"

  # Get PR info from GitHub API (using grep/sed instead of jq since it's not available in Vercel)
  API_URL="https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/pulls/$VERCEL_GIT_PULL_REQUEST_ID"
  PR_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API_URL")

  # Check if we got a valid response
  if [ -z "$PR_RESPONSE" ]; then
    echo "⚠️ No response from GitHub API"
  elif echo "$PR_RESPONSE" | grep -q '"message"'; then
    ERROR_MSG=$(echo "$PR_RESPONSE" | grep -o '"message":"[^"]*"' | sed 's/"message":"\([^"]*\)"/\1/')
    echo "⚠️ GitHub API error: $ERROR_MSG"
  fi

  # Extract base.ref from JSON (handles multiline JSON format)
  # Look for "base": { ... "ref": "branch-name" ... } across multiple lines
  PR_BASE=$(echo "$PR_RESPONSE" | grep -A 5 '"base"' | grep '"ref"' | head -1 | sed 's/.*"ref"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

  # If we got a valid base branch
  if [ -n "$PR_BASE" ] && [ "$PR_BASE" != "null" ]; then
    echo "➜ PR base branch: $PR_BASE"

    # Check if we should skip this branch
    SKIP_BRANCH="${SKIP_BUILD_FOR_BRANCH:-}"
    if [ -n "$SKIP_BRANCH" ] && [ "$PR_BASE" == "$SKIP_BRANCH" ]; then
      echo "🛑 Skipping build - PR targets $PR_BASE (matches SKIP_BUILD_FOR_BRANCH)"
      exit 0  # Skip build
    else
      echo "➜ PR targets $PR_BASE, not skipping (SKIP_BUILD_FOR_BRANCH=${SKIP_BRANCH:-"not set"})"
    fi
  else
    echo "⚠️ Could not get PR base branch"
  fi
else
  if [ -z "$VERCEL_GIT_PULL_REQUEST_ID" ]; then
    echo "➜ Not a PR (VERCEL_GIT_PULL_REQUEST_ID not set)"
  fi
  if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️ GITHUB_TOKEN not set, cannot check PR base branch"
  fi
fi

echo "✅ Proceeding with build"
exit 1  # Proceed with build