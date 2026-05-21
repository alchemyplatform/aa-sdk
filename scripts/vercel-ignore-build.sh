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

# Check if we should skip builds for a specific branch and its descendants
SKIP_BRANCH="${SKIP_BUILD_FOR_BRANCH:-}"

if [ -n "$SKIP_BRANCH" ]; then
  echo "➜ Will skip builds for $SKIP_BRANCH and any branches descended from it"

  # Skip if we're directly on the skip branch
  if [ "$VERCEL_GIT_COMMIT_REF" == "$SKIP_BRANCH" ]; then
    echo "🛑 Skipping build - on $SKIP_BRANCH branch"
    exit 0
  fi

  # Fetch origin branches to check ancestry (need enough history to find common commits)
  echo "➜ Fetching git history to check branch ancestry..."
  git fetch origin main --depth=200 2>/dev/null || true
  git fetch origin "$SKIP_BRANCH" --depth=200 2>/dev/null || true

  # Find commits that are unique to the skip branch (exist in skip branch but not in main)
  # If any of these commits are ancestors of HEAD, this branch descended from the skip branch
  UNIQUE_COMMIT=$(git log --oneline "origin/$SKIP_BRANCH" ^origin/main 2>/dev/null | head -1 | awk '{print $1}')

  if [ -n "$UNIQUE_COMMIT" ]; then
    echo "➜ Found commit unique to $SKIP_BRANCH: $UNIQUE_COMMIT"
    
    # Check if this unique commit is in the current branch's history
    if git merge-base --is-ancestor "$UNIQUE_COMMIT" HEAD 2>/dev/null; then
      echo "🛑 Skipping build - branch is descended from $SKIP_BRANCH"
      exit 0
    else
      echo "➜ Branch does not descend from $SKIP_BRANCH"
    fi
  else
    echo "⚠️ Could not find commits unique to $SKIP_BRANCH"
    echo "➜ Falling back to PR-based detection..."
    
    # Fallback: Check GitHub API for PR base branch
    if [ -n "$GITHUB_TOKEN" ]; then
      if [ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]; then
        echo "➜ Checking PR #$VERCEL_GIT_PULL_REQUEST_ID base branch..."
        API_URL="https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/pulls/$VERCEL_GIT_PULL_REQUEST_ID"
        PR_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API_URL")
      else
        echo "➜ Looking for PR with head branch: $VERCEL_GIT_COMMIT_REF..."
        API_URL="https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/pulls?state=open&head=$VERCEL_GIT_REPO_OWNER:$VERCEL_GIT_COMMIT_REF"
        PR_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API_URL")
      fi

      if [ -n "$PR_RESPONSE" ]; then
        PR_BASE=$(echo "$PR_RESPONSE" | grep -A 5 '"base"' | grep '"ref"' | head -1 | sed 's/.*"ref"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

        if [ -n "$PR_BASE" ]; then
          echo "➜ PR base branch: $PR_BASE"

          if [ "$PR_BASE" = "$SKIP_BRANCH" ]; then
            echo "🛑 Skipping build - PR targets $SKIP_BRANCH"
            exit 0
          fi
        fi
      fi
    else
      echo "⚠️ GITHUB_TOKEN not set, cannot check PR base branch"
    fi
  fi
else
  echo "➜ SKIP_BUILD_FOR_BRANCH not set, no branch ancestry check"
fi

echo "✅ Proceeding with build"
exit 1  # Proceed with build
