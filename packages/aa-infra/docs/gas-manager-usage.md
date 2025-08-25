# Alchemy Gas Manager Hooks Usage Guide

This guide explains how to use Alchemy Gas Manager hooks with viem's bundler client for both test and production environments.

## Overview

The `alchemyGasManagerHooks` function provides hooks for integrating Alchemy's Gas Manager with viem's bundler client. It supports two usage patterns:

1. **Test environments**: Direct spread operator usage
2. **Production environments**: Bind pattern for client access

## Production Usage

In production, you must bind the hooks to a client that can make RPC calls to Alchemy:

```typescript
import { createBundlerClient, createClient, http } from "viem";
import { alchemyGasManagerHooks } from "@account-kit/infra";
import { sepolia } from "viem/chains";

// 1. Create a client with Alchemy transport
const client = createClient({
  chain: sepolia,
  transport: http("https://eth-sepolia.g.alchemy.com/v2/your-api-key"),
  account, // Your smart account
});

// 2. Create gas manager hooks
const gasManagerHooks = alchemyGasManagerHooks("your-policy-id");

// 3. Bind the hooks to the client
const boundHooks = gasManagerHooks.bind(client);

// 4. Create bundler client with bound hooks
const bundlerClient = createBundlerClient({
  chain: sepolia,
  transport: http("https://eth-sepolia.g.alchemy.com/v2/your-api-key"),
  account,
  ...boundHooks, // Spread the bound hooks
});
```

## Test Environment Usage

In test environments with local instances, the spread operator pattern works directly:

```typescript
import { createBundlerClient } from "viem/account-abstraction";
import { alchemyGasManagerHooks } from "@account-kit/infra";

const bundlerClient = createBundlerClient({
  chain: local070Instance.chain,
  transport: custom(client),
  account,
  ...alchemyGasManagerHooks("test-policy"), // Direct spread works in tests
});
```

## ERC-20 Token Payments

To pay for gas using ERC-20 tokens:

```typescript
const gasManagerHooks = alchemyGasManagerHooks("your-policy-id", {
  address: "0xYourERC20TokenAddress",
  maxTokenAmount: BigInt("1000000"), // Max tokens to spend on gas
});

const boundHooks = gasManagerHooks.bind(client);
```

## How It Works

The implementation uses a hybrid approach:

1. **Default hooks**: Return minimal values for test environments
2. **Bound hooks**: When `.bind(client)` is called, creates hooks that can make actual RPC calls
3. **Caching**: Results from `getPaymasterStubData` are cached for use by `getPaymasterData`
4. **Fee estimation**: Integrates with Alchemy's fee estimation or uses cached values

## API Reference

### `alchemyGasManagerHooks(policyId, policyToken?)`

Creates gas manager hooks with bind support.

**Parameters:**
- `policyId`: `string | string[]` - Your Alchemy Gas Manager policy ID(s)
- `policyToken`: `PolicyToken` (optional) - ERC-20 token configuration

**Returns:** `AlchemyGasManagerHooksWithBind` - Hooks object with `.bind()` method

### `.bind(client)`

Binds the hooks to a client for production use.

**Parameters:**
- `client`: `Client` - A viem client with Alchemy transport and smart account

**Returns:** `AlchemyGasManagerHooks` - Bound hooks ready for production use

## Why Two Patterns?

This dual approach is necessary because:

1. **viem's architecture**: Paymaster hooks don't receive a client parameter
2. **Alchemy's requirements**: Gas Manager needs to make RPC calls
3. **Test flexibility**: Test environments can intercept calls at the transport layer
4. **Production needs**: Real environments require actual RPC calls to Alchemy

The `.bind()` pattern allows us to capture the client through closure, making it available to the hooks when they need to make RPC calls.
