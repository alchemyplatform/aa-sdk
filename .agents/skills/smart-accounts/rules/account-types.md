# Account Types

Keep account-family behavior distinct.

## Why

The package exposes multiple account models: Light Account, Multi-Owner Light
Account, Modular Account v1, Modular Account v2, and EIP-7702-related static
implementations. These types have different address prediction, ownership, and
module assumptions.

## Good

- Update the specific account family being changed.
- Add or update tests for address prediction and account construction when
  touching static implementations.
- Preserve public names exported from `packages/smart-accounts/src/index.ts`
  unless the change is intentionally breaking.

## Bad

Applying a Modular Account v2 helper to Light Account flows because both return
smart account objects.

## Exceptions

Shared helpers are fine when tests cover all affected account families.
