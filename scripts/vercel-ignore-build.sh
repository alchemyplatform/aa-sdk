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

# Check GitHub API for PR information
SKIP_BRANCH="${SKIP_BUILD_FOR_BRANCH:-}"
if [ -n "$SKIP_BRANCH" ] && [ -n "$GITHUB_TOKEN" ]; then

  # Method 1: If we have a PR ID, use it
  if [ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]; then
    echo "➜ Checking PR #$VERCEL_GIT_PULL_REQUEST_ID base branch..."

    API_URL="https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/pulls/$VERCEL_GIT_PULL_REQUEST_ID"
    PR_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API_URL")

  # Method 2: No PR ID yet - find PR by branch name
  else
    echo "➜ Looking for PR with head branch: $VERCEL_GIT_COMMIT_REF..."

    # Search for open PRs from this branch
    API_URL="https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/pulls?state=open&head=$VERCEL_GIT_REPO_OWNER:$VERCEL_GIT_COMMIT_REF"
    SEARCH_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API_URL")

    # Extract first PR from array response
    PR_RESPONSE=$(echo "$SEARCH_RESPONSE" | grep -A 100 '"base"' | head -110)
  fi

  # Extract base.ref from the PR response
  if [ -n "$PR_RESPONSE" ]; then
    PR_BASE=$(echo "$PR_RESPONSE" | grep -A 5 '"base"' | grep '"ref"' | head -1 | sed 's/.*"ref"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

    if [ -n "$PR_BASE" ]; then
      echo "➜ PR base branch: $PR_BASE"

      if [ "$PR_BASE" = "$SKIP_BRANCH" ]; then
        echo "🛑 Skipping build - PR targets $SKIP_BRANCH"
        exit 0  # Skip build
      else
        echo "➜ PR targets $PR_BASE, not skipping"
      fi
    else
      echo "➜ No PR found or could not determine base branch"
    fi
  fi
elif [ -z "$GITHUB_TOKEN" ]; then
  echo "⚠️ GITHUB_TOKEN not set, cannot check PR base branch"
fi

echo "✅ Proceeding with build"
exit 1  # Proceed with build