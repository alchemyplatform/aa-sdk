# Migration Plan: getAuthClient from Account Kit to V5 connectors-web

Based on analysis of the codebase, here's a comprehensive migration plan for porting the `getAuthClient` functionality to the v5 `packages/connectors-web` package.

## Current State Analysis

**Existing Implementation:**

- `AuthClient` class exists in `/packages/signer/src/authClient.ts`
- `createWebAuthClient` factory function in `/packages/signer-web/src/createWebAuthClient.ts`
- Stub implementations in `packages/connectors-web/src/alchemyAuth.ts:115-118`
- Stub implementations in `packages/wagmi-core/src/actions/` for `sendEmailOtp` and `submitOtpCode`

**Key Dependencies:**

- `@alchemy/signer` - Contains the core `AuthClient` class
- `@alchemy/signer-web` - Contains web-specific `createWebAuthClient`
- `@turnkey/iframe-stamper` - For TEK stamper functionality
- Wagmi connector pattern for integration

## Migration Steps

### Phase 1: Update Dependencies and Imports

```bash
# Add required dependencies to connectors-web package.json
"@alchemy/signer": "*"
"@alchemy/signer-web": "*"
"@turnkey/iframe-stamper": "^3.0.0"
```

### Phase 2: Implement getAuthClient in alchemyAuth Connector

**Location:** `/packages/connectors-web/src/alchemyAuth.ts:115-118`

**Implementation approach:**

1. Import `createWebAuthClient` from `@alchemy/signer-web`
2. Store AuthClient instance in connector state
3. Implement lazy initialization pattern
4. Add proper TypeScript typing for `AuthClient`

**Key changes:**

```typescript
// Update Properties type
type Properties = {
  getAuthClient(): Promise<AuthClient>;
  getSigner(): Promise<AlchemySigner>;
};

// Implementation
async getAuthClient() {
  if (!authClientInstance) {
    authClientInstance = createWebAuthClient({
      apiKey: this.options.apiKey, // from connector config
      iframeElementId: this.options.iframeElementId,
      iframeContainerId: this.options.iframeContainerId,
    });
  }
  return authClientInstance;
}
```

### Phase 3: Update AlchemyAuthOptions Interface

**Location:** `/packages/connectors-web/src/alchemyAuth.ts:6-8`

**Extend options to include:**

```typescript
export interface AlchemyAuthOptions {
  apiKey: string;
  iframeElementId?: string;
  iframeContainerId?: string;
  enablePopupOauth?: boolean;
  sessionConfig?: {
    expiryInSeconds?: number;
    sessionKey?: string;
  };
  // Additional web-specific options
}
```

### Phase 4: Implement Missing Connector Methods

**Update these methods in `alchemyAuth.ts` to work with AuthClient:**

1. **`connect()`** - Use AuthClient to authenticate and get accounts
2. **`getAccounts()`** - Extract accounts from authenticated signer
3. **`isAuthorized()`** - Check if user has valid session
4. **`disconnect()`** - Clear AuthClient instance and signer state

### Phase 5: Complete wagmi-core Action Implementations

**Update:** `/packages/wagmi-core/src/actions/sendEmailOtp.ts`

```typescript
export async function sendEmailOtp(
  config: Config,
  parameters: SendEmailOtpParameters,
): Promise<SendEmailOtpReturnType> {
  const connector = resolveSmartWallet(config);
  const authClient = await connector.getAuthClient();
  await authClient.sendEmailOtp({ email: parameters.email });
}
```

**Update:** `/packages/wagmi-core/src/actions/submitOtpCode.ts`

```typescript
export async function submitOtpCode(
  config: Config,
  parameters: SubmitOtpCodeParameters,
): Promise<SubmitOtpCodeReturnType> {
  const connector = resolveSmartWallet(config);
  const authClient = await connector.getAuthClient();
  const signer = await authClient.submitOtpCode({
    otpCode: parameters.otpCode,
  });
  // Store signer in connector
  connector.setSigner(signer);
  // Trigger wagmi connection
  await connect(config, { connector });
}
```

### Phase 6: Add Helper Utilities

**Create:** `/packages/connectors-web/src/utils/resolveConnector.ts`

```typescript
import type { Config, Connector } from "wagmi";

export interface SmartWalletConnector extends Connector {
  getAuthClient(): Promise<AuthClient>;
  getSigner(): Promise<AlchemySigner>;
}

export function resolveSmartWallet(
  config: Config,
  id = "alchemyAuth",
): SmartWalletConnector {
  const connector = config.connectors.find((c) => c.id === id);
  if (!connector) {
    throw new Error(`Alchemy connector ("${id}") not found`);
  }
  return connector as SmartWalletConnector;
}
```

### Phase 7: Add Additional Auth Actions

**Create:** `/packages/connectors-web/src/actions/`

- `loginWithOauth.ts`
- `loginWithPasskey.ts`
- `handleOauthRedirect.ts`
- `getAlchemySigner.ts`

Following the same pattern as `sendEmailOtp` and `submitOtpCode`.

### Phase 8: Update Type Exports

**Update:** `/packages/connectors-web/src/index.ts`

```typescript
export { alchemyAuth, type AlchemyAuthOptions } from "./alchemyAuth.js";
export {
  resolveSmartWallet,
  type SmartWalletConnector,
} from "./utils/resolveConnector.js";

// Export action types
export type * from "./actions/index.js";
```

### Phase 9: Integration Testing

**Test scenarios:**

1. Email OTP flow end-to-end
2. OAuth popup flow
3. OAuth redirect flow
4. Connector state management
5. Multiple connector instances
6. Error handling and cleanup

### Phase 10: Documentation Updates

**Update design docs and examples:**

1. Update connector usage examples
2. Add migration guide from account-kit
3. Document new action patterns
4. Add troubleshooting guide

## Key Implementation Notes

1. **State Management:** AuthClient instances should be scoped to individual connectors to support multiple wallet connections
2. **Error Handling:** Proper cleanup of iframes, popups, and event listeners on failures
3. **TypeScript:** Ensure full type safety across the connector interface
4. **Backwards Compatibility:** Design should not break existing wagmi-core consumers
5. **Performance:** Lazy initialization to avoid unnecessary iframe creation

## Dependencies to Resolve

1. Confirm `@alchemy/signer` and `@alchemy/signer-web` APIs are stable
2. Verify Turnkey iframe integration patterns
3. Test OAuth callback handling in connector context
4. Validate session persistence requirements

## Implementation Priority

### High Priority (Phase 1-5)

- Core `getAuthClient()` implementation
- Basic email OTP flow
- Essential connector methods
- Basic type safety

### Medium Priority (Phase 6-8)

- Helper utilities
- Additional auth methods
- Complete type exports
- Error handling improvements

### Low Priority (Phase 9-10)

- Comprehensive testing
- Documentation
- Migration guides
- Performance optimizations

This migration plan provides a structured approach to port the `getAuthClient` functionality while maintaining the clean separation between the connector layer and the underlying authentication logic.
