# V5 Graduation: Remaining Steps

This PR completes Phase 1 (code changes). The remaining phases move v5 to `main` and update external dependencies.

---

## Phase 2: Branch Swap

**Prerequisites**: This PR is merged to `v5.x.x`. Freeze merges to both `v5.x.x` and `main`.

### 2.1 - Create 4.x.x preservation branch

```bash
git fetch origin
git push origin origin/main:refs/heads/4.x.x
```

### 2.2 - Move v5 to main

**Option A: Temporary branch protection bypass (preferred)**

Ask an admin to temporarily disable branch protection on `main` for ~1 minute:

```bash
git push origin origin/v5.x.x:refs/heads/main --force
```

Re-enable protection immediately after.

**Option B: PR-based merge**

```bash
git checkout -b graduate-v5-to-main origin/v5.x.x
git merge origin/main -s ours --no-edit
git push origin graduate-v5-to-main
# Open PR: graduate-v5-to-main -> main
```

The `-s ours` strategy keeps v5 content while linking main's history via the merge commit. Harder to verify correctness than Option A.

### 2.3 - Verify

```bash
git fetch origin
git log --oneline origin/main -5       # Should show v5 commits
git log --oneline origin/4.x.x -3     # Should show v4 commits (v4.88.2, etc.)
```

---

## Phase 3: Post-Migration Verification

1. **CI smoke test** - Open a trivial test PR against `main` to verify `on-pull-request.yml` runs correctly.
2. **Publish dry run** - Trigger `publish-package.yml` with `publish: false` to verify checkout and version output.
3. **First stable publish** - Trigger `publish-package.yml` with `publish: true`. Verify `@alchemy/wallet-apis@5.0.0` etc. appear on npm with `latest` tag.
4. **Docs pipelines** - Confirm `trigger-sdk-indexer.yml` and `revalidate-sdk-content.yml` fire on the publish commit push. Spot-check docs site reference pages for correct source links (pointing to `main`).

---

## Phase 4: v4 Maintenance Setup (on 4.x.x branch)

### 4.1 - Add branch protection to 4.x.x

Apply similar protection rules as main (required reviews, status checks).

---

## Phase 5: External Repository Updates

### 5.1 - OMGWINNING/wallet-server

| File | Change |
|------|--------|
| `.github/workflows/test-e2e.yml` | `git clone ... -b v5.x.x` -> `-b main` |
| `.agents/commands/run-e2e.md` | Update "Clones aa-sdk at v5.x.x" -> "at main" |

### 5.2 - alchemyplatform/docs (~23 files)

- Remove `<Info>` blocks saying v5 "is currently in beta" from ~23 wallet docs pages
- Update GitHub links from `tree/v5.x.x` to `tree/main` (e.g., in `quickstart/sdk.mdx`)
- Update `content/wallets/shared/v4-accordion.mdx` version references

Files to update:
- `content/wallets/pages/smart-wallets/quickstart/sdk.mdx`
- `content/wallets/pages/concepts/smart-account-client.mdx`
- `content/wallets/pages/resources/migration-v5.mdx`
- `content/wallets/pages/signer/authentication/server-wallets.mdx`
- `content/wallets/pages/recipes/programmatic-wallet-creation.mdx`
- `content/wallets/pages/recipes/smart-wallets-aave.mdx`
- `content/wallets/pages/smart-wallets/session-keys/sdk.mdx`
- `content/wallets/pages/transactions/send-transactions/client.mdx`
- `content/wallets/pages/transactions/send-transactions/prepare-calls/client.mdx`
- `content/wallets/pages/transactions/send-batch-transactions/client.mdx`
- `content/wallets/pages/transactions/send-parallel-transactions/client.mdx`
- `content/wallets/pages/transactions/retry-transactions/client.mdx`
- `content/wallets/pages/transactions/sponsor-gas/client.mdx`
- `content/wallets/pages/transactions/pay-gas-with-any-token/client.mdx`
- `content/wallets/pages/transactions/swap-tokens/client.mdx`
- `content/wallets/pages/transactions/using-eip-7702/client.mdx`
- `content/wallets/pages/transactions/undelegate-account/client.mdx`
- `content/wallets/pages/transactions/signing/sign-messages/client-text.mdx`
- `content/wallets/pages/transactions/signing/sign-messages/client-raw.mdx`
- `content/wallets/pages/transactions/signing/sign-typed-data/client.mdx`
- `content/wallets/pages/transactions/cross-chain-swap-tokens/client.mdx`
- `content/wallets/pages/bundler-api/bundler-sponsored-operations.mdx`
- `content/wallets/shared/v4-accordion.mdx`

### 5.3 - Clean up v5.x.x branch

After confirming everything works, the `v5.x.x` branch can be deleted (its content now lives on `main`).
