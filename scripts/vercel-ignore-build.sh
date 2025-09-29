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

  # Debug: Show the API URL we're calling
  API_URL="https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/pulls/$VERCEL_GIT_PULL_REQUEST_ID"
  echo "API URL: $API_URL"

  # Get PR info from GitHub API (using grep/sed instead of jq since it's not available in Vercel)
  PR_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API_URL")

  # Debug: Check if we got a response
  if [ -z "$PR_RESPONSE" ]; then
    echo "⚠️ No response from GitHub API"
  else
    # Check for API errors
    if echo "$PR_RESPONSE" | grep -q '"message"'; then
      ERROR_MSG=$(echo "$PR_RESPONSE" | grep -o '"message":"[^"]*"' | sed 's/"message":"\([^"]*\)"/\1/')
      echo "⚠️ GitHub API error: $ERROR_MSG"
    fi

    # Debug: Show first 200 chars of response
    echo "Response preview: $(echo "$PR_RESPONSE" | head -c 200)..."
  fi

  # Extract base.ref from JSON using sed (looking for pattern: "base":{"ref":"branch-name")
  PR_BASE=$(echo "$PR_RESPONSE" | grep -o '"base":{[^}]*"ref":"[^"]*"' | sed 's/.*"ref":"\([^"]*\)".*/\1/')

  # Debug: Show what we extracted
  echo "Extracted PR_BASE: '$PR_BASE'"

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