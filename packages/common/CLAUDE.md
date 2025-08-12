# CLAUDE.md - @alchemy/common

This file provides guidance to Claude Code (claude.ai/code) when working with the @alchemy/common package.

## Package Overview

**@alchemy/common** is the foundational infrastructure package for V5 SDK that consolidates shared utilities from V4's `@account-kit/infra` and `@account-kit/logging` into a reusable library. It serves as the base layer for all other `@alchemy/*` packages.

## Relationship to V5 Architecture

### Position in the Stack

```
@alchemy/wallet-apis (High-level APIs)
    ↓
@alchemy/smart-accounts (Account implementations)
    ↓
@alchemy/common (Shared infrastructure) ← This package
    ↓
viem (Ethereum client)
```

### Key Responsibilities

- **Transport Layer**: Alchemy-optimized viem transport with header management
- **Connection Configuration**: V5 schema validation with discriminated unions
- **Chain Management**: Curated chain configurations (V4 pattern currently)
- **Error Handling**: Base error classes and utilities
- **Logging**: Analytics and event tracking (future)
- **Shared Types**: Common utilities and type definitions

## Development Commands

```bash
# From package root (/packages/common)
yarn build              # Full build (prebuild + esm + types)
yarn build:esm          # Build ESM JavaScript output
yarn build:types        # Build TypeScript declaration files
yarn clean              # Remove dist/ directory
yarn test               # Run tests in watch mode
yarn test:run           # Run tests once
yarn fern:gen           # Generate API documentation
```

### Code Quality & Linting

The project uses ESLint with JSDoc validation rules. To catch and fix JSDoc issues:

```bash
# From project root (/Users/brian/dev/aa-sdk)
# Check for JSDoc issues in a specific file
OPENAI_API_KEY=dummy npx eslint packages/common/src/config/schema.ts --format=compact

# Check all files in config directory
OPENAI_API_KEY=dummy npx eslint packages/common/src/config/ --format=compact

# Auto-fix JSDoc issues (where possible)
OPENAI_API_KEY=dummy npx eslint packages/common/src/config/schema.ts --fix

# Check entire common package
OPENAI_API_KEY=dummy npx eslint packages/common/src/ --format=compact
```

**Important**: The project's ESLint configuration requires complete JSDoc documentation:

- **@param {type} name description** - All parameters must include type annotations
- **@returns {type} description** - All return values must be documented with types
- **@throws {ErrorType} description** - All thrown errors should be documented

**Common JSDoc Issues to Fix**:

- Missing `@param` type: `@param {string} apiKey` instead of `@param apiKey`
- Missing `@returns` type: `@returns {boolean}` instead of `@returns`
- Optional parameters: Use `@param {object} [options]` for optional params
- Nested options: `@param {string} [options.chainAgnosticUrl]` for object properties

### Build Process

1. **Prebuild**: `tsx ./inject-version.ts` - Injects package version into `src/version.ts`
2. **ESM Build**: `tsc --project tsconfig.build.json --outDir ./dist/esm`
3. **Types Build**: `tsc --project tsconfig.build.json --declarationDir ./dist/types --emitDeclarationOnly --declaration --declarationMap`

## Current Architecture (V5 Migration Status)

### ✅ **COMPLETED** - Transport Infrastructure

- **Location**: `src/transport/`
- **Files**: `alchemy.ts`, `split.ts`, `connection.ts`, `types.ts`
- **Status**: Fully migrated from V4 with working transport factory and split functionality
- **Exports**: `alchemy()`, `isAlchemyTransport()`, `split()`

### ✅ **COMPLETED** - V5 Configuration Schema

- **Location**: `src/config/`
- **Files**: `schema.ts`, `compatibility.ts`, `index.ts`
- **Status**: **NEWLY IMPLEMENTED** - V5 discriminated union schema with runtime validation
- **Key Features**:
  - Discriminated unions for O(1) validation performance
  - Enhanced error messages with field-specific details
  - Factory functions for common configurations
  - Backward compatibility layer

#### V5 Schema Design

```typescript
// Clean discriminated union approach
type V5AlchemyConnectionConfig =
  | { type: "apiKey"; apiKey: string; chainAgnosticUrl?: string }
  | { type: "jwt"; jwt: string; chainAgnosticUrl?: string }
  | { type: "rpcUrl"; rpcUrl: string; chainAgnosticUrl?: string }
  | { type: "proxyUrl"; proxyUrl: string; chainAgnosticUrl?: string }
  | { type: "aaOnly"; alchemyConnection: AuthConfig; nodeRpcUrl: string };
```

### ✅ **COMPLETED** - Error Infrastructure

- **Location**: `src/errors/`
- **Files**: `BaseError.ts`, `ChainNotFoundError.ts`, `AccountNotFoundError.ts`, `FetchError.ts`, `ServerError.ts`
- **Status**: Migrated from V4 with enhanced `ConnectionConfigError` for schema validation

### ✅ **COMPLETED** - Chain Definitions

- **Location**: `src/chains.ts`
- **Status**: V4 pattern with 30+ pre-configured chains
- **Note**: Uses `defineAlchemyChain()` pattern - V5 design would use internal registry + utilities

### ❌ **MISSING** - Client Infrastructure

- **Status**: Not implemented yet
- **Required**: `createRpcClient()` factory with Alchemy RPC method typing
- **V4 Source**: `@account-kit/infra/src/client/rpcClient.ts`

### ❌ **MISSING** - Logging System

- **Status**: Not implemented yet
- **Required**: `createLogger()` factory from `@account-kit/logging`
- **V0 Note**: Will exclude Segment integration initially

### ❌ **MISSING** - Shared Type Utilities

- **Status**: Partial implementation
- **Required**: `BigNumberish`, `isBigNumberish()`, header utilities
- **Location**: `src/utils/types.ts` exists but needs content

## Common Development Patterns

### Working with V5 Configuration Schema

```typescript
import {
  createApiKeyConfig,
  validateAlchemyConnectionConfig,
  isAlchemyConnectionConfig,
  ConnectionConfigError,
} from "@alchemy/common";

// Factory function approach (recommended)
const config = createApiKeyConfig("your-api-key", {
  chainAgnosticUrl: "https://api.g.alchemy.com/v2",
});

// Direct validation approach
try {
  const userConfig = validateAlchemyConnectionConfig({
    type: "jwt",
    jwt: "your-jwt-token",
  });
} catch (error) {
  if (error instanceof ConnectionConfigError) {
    console.log("Field errors:", error.getFieldErrors());
    console.log("Formatted message:", error.getFormattedMessage());
  }
}

// Runtime type checking
if (isAlchemyConnectionConfig(unknownConfig)) {
  // TypeScript knows the exact discriminated union type here
  console.log(unknownConfig.type); // "apiKey" | "jwt" | "rpcUrl" | etc.
}
```

### Working with Transport Layer

```typescript
import { alchemy, split } from "@alchemy/common";

// Basic Alchemy transport
const transport = alchemy({
  type: "apiKey",
  apiKey: "your-api-key",
});

// AA-only chain configuration
const aaTransport = alchemy({
  type: "aaOnly",
  alchemyConnection: {
    type: "apiKey",
    apiKey: "your-api-key",
  },
  nodeRpcUrl: "https://zora.rpc.url",
});

// Advanced split transport
const splitTransport = split({
  overrides: [
    {
      methods: ["eth_chainId"],
      transport: http("https://alternative-rpc.com"),
    },
  ],
  fallback: http("https://main-rpc.com"),
});
```

### Error Handling Patterns

```typescript
import { BaseError, ConnectionConfigError } from "@alchemy/common";

// Custom error extending BaseError
class CustomAlchemyError extends BaseError {
  constructor(message: string, cause?: Error) {
    super(message, { cause });
    this.name = "CustomAlchemyError";
  }
}

// Configuration validation errors
try {
  validateAlchemyConnectionConfig(userInput);
} catch (error) {
  if (error instanceof ConnectionConfigError) {
    // Handle schema validation errors
    const fieldErrors = error.getFieldErrors();
    console.error("Configuration errors:", fieldErrors);
  }
}
```

## Testing

### Test Structure

- **Location**: `src/**/__tests__/` or `src/**/*.test.ts`
- **Framework**: Vitest
- **Current Coverage**: Schema validation tests implemented

### Running Tests

```bash
yarn test                    # Watch mode
yarn test:run                # Single run
yarn test src/config/        # Test specific directory
```

### Test Examples

```typescript
import { describe, it, expect } from "vitest";
import {
  createApiKeyConfig,
  validateAlchemyConnectionConfig,
} from "../schema.js";

describe("AlchemyConnectionConfigSchema", () => {
  it("should validate API key config", () => {
    const config = createApiKeyConfig("test-key");
    expect(config).toEqual({
      type: "apiKey",
      apiKey: "test-key",
    });
  });
});
```

## Integration Points

### With Other V5 Packages

- **@alchemy/wallet-apis**: Will use client factories and transport from common
- **@alchemy/smart-accounts**: Will use error classes and shared types
- **Higher-level packages**: Will consume configuration schema and transport

### With V4 Packages (During Migration)

- **Backward Compatibility**: Legacy connection types still exported
- **Compatibility Layer**: Conversion functions between V4/V5 formats
- **No Breaking Changes**: Current functionality preserved during migration

## Migration Status & Next Steps

### Immediate Priorities (Next Implementation)

1. **Client Infrastructure**: `createRpcClient()` factory with Alchemy RPC methods
2. **Shared Type Utilities**: `BigNumberish`, header utilities, type guards
3. **Logging System**: `createLogger()` factory (v0 without Segment)

### Future Enhancements

1. **HTTP Debugging Options**: Add `httpOptions` to transport config for viem debugging
2. **Chain Architecture Refactor**: Move from 46 exports to internal registry + utilities
3. **Advanced Validation**: Add type-level assertions for compile-time schema checking

### V4 → V5 Export Mapping

| V4 Source                        | V5 Destination              | Status                   |
| -------------------------------- | --------------------------- | ------------------------ |
| `@account-kit/infra` transport   | `@alchemy/common` transport | ✅ Complete              |
| `@account-kit/infra` errors      | `@alchemy/common` errors    | ✅ Complete              |
| `@account-kit/infra` chains      | `@alchemy/common` chains    | ✅ Complete (V4 pattern) |
| `@account-kit/infra` client      | `@alchemy/common` client    | ❌ Missing               |
| `@account-kit/logging`           | `@alchemy/common` logging   | ❌ Missing               |
| `@aa-sdk/core` connection schema | `@alchemy/common` config    | ✅ Complete (V5 design)  |

## Key Files & Directories

```
src/
├── config/                  # ✅ V5 configuration schema
│   ├── schema.ts           # Discriminated union schema + validation
│   ├── compatibility.ts    # V4/V5 conversion helpers
│   └── index.ts           # Config exports
├── transport/              # ✅ Transport layer
│   ├── alchemy.ts         # Main transport factory
│   ├── split.ts           # Split transport utility
│   ├── connection.ts      # Legacy connection types
│   └── types.ts           # Transport type definitions
├── errors/                 # ✅ Error classes
│   ├── BaseError.ts       # Foundation error class
│   ├── ConnectionConfigError.ts  # Schema validation errors
│   └── ...                # Other specific error types
├── chains.ts              # ✅ Chain configurations (V4 pattern)
├── utils/                 # ⚠️ Partial - needs BigNumberish, etc.
│   └── types.ts          # Type utilities
├── version.ts             # ✅ Auto-generated version
└── index.ts              # ✅ Main package exports
```

## Important Notes

### Configuration Schema Benefits

- **Performance**: O(1) validation vs O(n) complex unions
- **Error Messages**: Field-specific validation errors vs generic union failures
- **Type Safety**: Clean discriminated unions vs complex inferred types
- **Maintainability**: Isolated config types vs interdependent union combinations

### Transport Intelligence

- **Method Routing**: 46 Alchemy-specific RPC methods automatically routed to Alchemy
- **Fallback Strategy**: Graceful handling of unsupported methods
- **Header Management**: Automatic SDK version, auth, and tracking headers

### Build & Export Strategy

- **ESM Module**: Package is ESM-only (`"type": "module"`)
- **Dual Output**: Both JavaScript (`dist/esm/`) and TypeScript declarations (`dist/types/`)
- **Tree Shaking**: `"sideEffects": false` for optimal bundling
- **Multiple Entry Points**: Main export + specific exports for chains, client, etc.

### Development Workflow

1. **Make changes** to source files in `src/`
2. **Run tests** with `yarn test` to verify functionality
3. **Build package** with `yarn build` to ensure TypeScript compilation
4. **Check exports** by importing from the package in other workspaces
5. **Update documentation** if adding new public APIs

This package serves as the **foundational infrastructure layer** for the V5 SDK architecture, providing essential transport, configuration, and utility functionality that all other V5 packages depend on.
