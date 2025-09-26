# AuthSessionState Persistence Implementation Guide

## Overview

This document provides a complete implementation plan for adding persistent state functionality to the AuthClient and AuthSession classes for the alchemyAuth Wagmi connector. The goal is to enable session rehydration across browser refreshes while maintaining security best practices.

## Current State Analysis

### What's Working

- Basic `AuthSessionState` type defined in `packages/auth/src/types.ts`
- `loadAuthSessionState()` method signature exists in `AuthClient`
- `getAuthSessionState()` method signature exists in `AuthSession`
- Bundle-based auth flow via `completeAuthWithBundle()`

### What's Missing

1. **Bundle Storage**: Bundles are consumed by stamper but not stored in AuthSession
2. **State Serialization**: `getAuthSessionState()` returns `notImplemented()`
3. **Runtime Context**: `loadAuthSessionState()` needs connector-provided context
4. **Type Corrections**: AuthSessionState includes connector-level data (chainId)
5. **Passkey Support**: Missing credentialId handling for passkey rehydration

## Problem Analysis: The Bundle Flow

### Current Bundle Lifecycle

```typescript
// 1. Bundle Creation (OTP/OAuth flows)
const { credentialBundle } = await this.dev_request("otp", {...});

// 2. Bundle Consumption
completeAuthWithBundle({ bundle: credentialBundle, orgId }) {
  const { stamper } = await this.getTekStamper();
  await stamper.injectCredentialBundle(bundle); // ❌ Bundle consumed, lost

  return AuthSession.create({
    apiKey: this.apiKey,
    stamper, // Has bundle state internally
    orgId,
    idToken,
    // ❌ Bundle not passed through!
  });
}

// 3. AuthSession Creation
AuthSession.create({ apiKey, stamper, orgId, idToken }) {
  // ❌ No knowledge of original bundle
  const user = await whoamiCall();
  return new AuthSession(apiKey, turnkey, user); // ❌ Bundle lost forever
}
```

### The Solution: Dual Bundle Usage

The bundle needs to serve two purposes:

1. **Immediate consumption** by stamper for cryptographic operations
2. **Persistence** in AuthSession for future rehydration

## Implementation Plan

### Step 1: Fix Bundle Storage Chain

#### 1.1 Update CreateAuthSessionParams

**File**: `packages/auth/src/authSession.ts`

```typescript
export type CreateAuthSessionParams = {
  apiKey: string;
  stamper: TurnkeyStamper;
  orgId: string;
  idToken: string | undefined;
  credentialBundle?: string; // ✅ Add this
  authType?: "email" | "oauth" | "otp" | "passkey"; // ✅ Track auth method
  credentialId?: string; // ✅ For passkey sessions
};
```

#### 1.2 Update AuthSession Constructor

**File**: `packages/auth/src/authSession.ts`

```typescript
export class AuthSession {
  private isDisconnected = false;

  private constructor(
    private readonly apiKey: string,
    private readonly turnkey: TurnkeyClient,
    private readonly user: User,
    private readonly credentialBundle?: string, // ✅ Store bundle
    private readonly authType?: "email" | "oauth" | "otp" | "passkey", // ✅ Store auth type
    private readonly credentialId?: string, // ✅ Store credential ID for passkeys
  ) {}

  public static async create({
    apiKey,
    stamper,
    orgId,
    idToken,
    credentialBundle, // ✅ Accept bundle
    authType, // ✅ Accept auth type
    credentialId, // ✅ Accept credential ID
  }: CreateAuthSessionParams): Promise<AuthSession> {
    // ... existing whoami logic
    return new AuthSession(
      apiKey,
      turnkey,
      user,
      credentialBundle, // ✅ Store bundle
      authType, // ✅ Store auth type
      credentialId, // ✅ Store credential ID
    );
  }
}
```

#### 1.3 Update completeAuthWithBundle

**File**: `packages/auth/src/authClient.ts`

```typescript
private async completeAuthWithBundle({
  bundle,
  orgId,
  idToken,
  authType = "oauth", // ✅ Default or determine from context
}: {
  bundle: string;
  orgId: string;
  idToken?: string;
  authType?: "email" | "oauth" | "otp";
}): Promise<AuthSession> {
  const { stamper } = await this.getTekStamper();
  const success = await stamper.injectCredentialBundle(bundle);
  if (!success) {
    throw new Error("Failed to inject credential bundle");
  }

  const authSession = await AuthSession.create({
    apiKey: this.apiKey,
    stamper,
    orgId,
    idToken,
    credentialBundle: bundle, // ✅ Pass through for storage
    authType, // ✅ Pass through auth type
  });

  this.tekStamperPromise = null;
  return authSession;
}
```

### Step 2: Update AuthSessionState Type

#### 2.1 Clean State Definition

**File**: `packages/auth/src/types.ts`

```typescript
// ✅ Remove runtime context, keep only persistent auth data
export type AuthSessionState =
  | {
      type: "email" | "oauth" | "otp";
      bundle: string;
      user: User;
      expirationDateMs: number;
    }
  | {
      type: "passkey";
      credentialId: string;
      user: User;
      expirationDateMs: number;
    };
```

**Key Changes**:

- ❌ Removed `chainId` (connector manages this)
- ❌ Removed `apiKey` (connector provides this)
- ✅ Added `credentialId` for passkey sessions
- ✅ Simplified to essential persistent data only

### Step 3: Implement getAuthSessionState()

#### 3.1 Complete Implementation

**File**: `packages/auth/src/authSession.ts`

```typescript
public getAuthSessionState(): AuthSessionState {
  this.throwIfDisconnected();

  // Calculate expiration (24 hours from now as default)
  const expirationDateMs = Date.now() + (24 * 60 * 60 * 1000);

  if (this.authType === "passkey") {
    if (!this.credentialId) {
      throw new Error("Passkey session missing credentialId");
    }
    return {
      type: "passkey",
      credentialId: this.credentialId,
      user: this.user,
      expirationDateMs,
    };
  } else {
    if (!this.credentialBundle) {
      throw new Error("Bundle-based session missing credentialBundle");
    }
    return {
      type: this.authType || "oauth", // Default to oauth if not specified
      bundle: this.credentialBundle,
      user: this.user,
      expirationDateMs,
    };
  }
}
```

### Step 4: Update loadAuthSessionState()

#### 4.1 Accept Runtime Context

**File**: `packages/auth/src/authClient.ts`

```typescript
/**
 * Loads an AuthSession from previously saved state with runtime context from connector
 *
 * @param {AuthSessionState} state - The saved authentication session state
 * @param {object} runtimeContext - Runtime context provided by connector
 * @param {string} runtimeContext.apiKey - API key for session creation
 * @returns {Promise<AuthSession | undefined>} AuthSession if valid, undefined if expired/invalid
 */
public async loadAuthSessionState(
  state: AuthSessionState,
  runtimeContext: {
    apiKey: string;
  }
): Promise<AuthSession | undefined> {
  const { type, expirationDateMs, user } = state;

  // Check expiration
  if (expirationDateMs <= Date.now()) {
    return undefined; // Session expired
  }

  try {
    if (type === "passkey") {
      const { credentialId } = state;
      // Note: loginWithPasskey needs to be updated to accept credentialId
      return this.loginWithPasskey(credentialId, runtimeContext.apiKey);
    } else {
      const { bundle } = state;
      const { orgId, idToken } = user;

      // Create temporary AuthClient with runtime apiKey for rehydration
      const tempClient = new AuthClient({
        apiKey: runtimeContext.apiKey,
        // ... other required params
      });

      return tempClient.completeAuthWithBundle({
        bundle,
        orgId,
        idToken,
        authType: type
      });
    }
  } catch (error) {
    // Bundle expired, stamper injection failed, etc.
    console.warn("Failed to rehydrate AuthSession:", error);
    return undefined;
  }
}
```

### Step 5: Update Auth Flow Entry Points

#### 5.1 Track Auth Types in Entry Methods

**File**: `packages/auth/src/authClient.ts`

```typescript
// Update submitOtpCode to track auth type
public async submitOtpCode(otpCode: string): Promise<AuthSession> {
  // ... existing logic
  return this.completeAuthWithBundle({
    bundle: credentialBundle,
    orgId,
    authType: "email" // ✅ Specify type
  });
}

// Update OAuth flows
public async loginWithOauth(params: LoginWithOauthParams): Promise<AuthSession> {
  // ... existing logic
  return this.completeAuthWithBundle({
    bundle: response.bundle!,
    orgId: response.orgId!,
    idToken: response.idToken,
    authType: "oauth" // ✅ Specify type
  });
}

// Update handleOauthRedirect
public async handleOauthRedirect(): Promise<AuthSession> {
  // ... existing logic
  return this.completeAuthWithBundle({
    bundle: callbackParams.bundle!,
    orgId: callbackParams.orgId!,
    idToken: callbackParams.idToken,
    authType: "oauth" // ✅ Specify type
  });
}
```

#### 5.2 Update Passkey Flow

**File**: `packages/auth/src/authClient.ts`

```typescript
// Update loginWithPasskey to support credential ID and store it
public async loginWithPasskey(credentialId?: string, apiKey?: string): Promise<AuthSession> {
  const stamper = await this.createWebAuthnStamper({ credentialId });

  // Use provided apiKey or fall back to instance apiKey
  const sessionApiKey = apiKey || this.apiKey;

  // Get orgId from stamper or user context
  const orgId = await this.getOrgIdFromStamper(stamper);

  return AuthSession.create({
    apiKey: sessionApiKey,
    stamper,
    orgId,
    idToken: undefined,
    authType: "passkey",
    credentialId, // ✅ Store for persistence
  });
}
```

### Step 6: Connector Integration

#### 6.1 Update Connector to Handle State Persistence

**File**: `packages/connectors-web/src/alchemyAuth.ts`

```typescript
export function alchemyAuth(parameters: AlchemyAuthOptions = {}) {
  let authSessionInstance: AuthSession | undefined;
  let currentChainId: number | undefined;

  return createConnector<Provider, Properties>((config) => ({
    // ... existing methods

    // ✅ Add state persistence helpers
    async setAuthSession(authSession: AuthSession) {
      authSessionInstance = authSession;

      // Persist session state for rehydration
      try {
        const sessionState = await authSession.getAuthSessionState();
        localStorage.setItem(
          "alchemy-auth-session",
          JSON.stringify(sessionState),
        );
      } catch (error) {
        console.warn("Failed to persist auth session:", error);
      }
    },

    // ✅ Add state rehydration on setup
    async setup() {
      try {
        const storedState = localStorage.getItem("alchemy-auth-session");
        if (storedState && parameters.apiKey) {
          const sessionState: AuthSessionState = JSON.parse(storedState);
          const authClient = this.getAuthClient();

          const rehydratedSession = await authClient.loadAuthSessionState(
            sessionState,
            { apiKey: parameters.apiKey }, // ✅ Provide runtime context
          );

          if (rehydratedSession) {
            authSessionInstance = rehydratedSession;
          } else {
            // Session expired or invalid, clear storage
            localStorage.removeItem("alchemy-auth-session");
          }
        }
      } catch (error) {
        console.warn("Failed to rehydrate auth session:", error);
        localStorage.removeItem("alchemy-auth-session");
      }
    },

    async disconnect() {
      // Clear persisted state on disconnect
      localStorage.removeItem("alchemy-auth-session");

      // ... existing disconnect logic
    },
  }));
}
```

## Implementation Steps (Ordered)

### Phase 1: Bundle Storage Foundation

1. **Update AuthSession constructor and types** (Step 1.1, 1.2)
2. **Update completeAuthWithBundle()** (Step 1.3)
3. **Test**: Verify bundles are stored without breaking existing flows

### Phase 2: State Serialization

1. **Update AuthSessionState type** (Step 2.1)
2. **Implement getAuthSessionState()** (Step 3.1)
3. **Test**: Verify state can be serialized for all auth types

### Phase 3: State Deserialization

1. **Update loadAuthSessionState()** (Step 4.1)
2. **Update auth flow entry points** (Step 5.1, 5.2)
3. **Test**: Verify state can be deserialized and sessions recreated

### Phase 4: Connector Integration

1. **Add persistence to connector** (Step 6.1)
2. **Add rehydration to connector setup** (Step 6.1)
3. **Test**: Full end-to-end persistence across browser refresh

## Testing Strategy

### Unit Tests

- [ ] Bundle storage in AuthSession
- [ ] State serialization for each auth type
- [ ] State deserialization with runtime context
- [ ] Expiration handling

### Integration Tests

- [ ] Complete OTP flow with persistence
- [ ] Complete OAuth flow with persistence
- [ ] Complete passkey flow with persistence
- [ ] Browser refresh recovery
- [ ] Invalid/expired state handling

### Manual Testing Checklist

- [ ] Authenticate via email OTP, refresh page → should restore session
- [ ] Authenticate via OAuth, refresh page → should restore session
- [ ] Authenticate via passkey, refresh page → should restore session
- [ ] Wait for expiration, refresh page → should require re-auth
- [ ] Disconnect, refresh page → should not restore session

## Security Considerations

### What's Stored

- ✅ **Bundle**: Encrypted credential bundle (already designed for client storage)
- ✅ **User data**: Non-sensitive user information
- ✅ **Expiration**: Time-based validity

### What's NOT Stored

- ❌ **API keys**: Always provided by connector at runtime
- ❌ **Raw private keys**: Only encrypted bundles
- ❌ **Sensitive claims**: Only basic user info

### Storage Security

- Use `localStorage` for persistence (standard for web auth)
- Clear storage on explicit disconnect
- Handle storage failures gracefully
- Validate state before rehydration

## Migration Path

Since this is a new feature, no migration is needed. Existing sessions without persistent state will continue working normally and gain persistence on their next authentication.

## Future Enhancements

1. **Storage Options**: Support sessionStorage or custom storage backends
2. **State Encryption**: Client-side encryption of stored state
3. **Multi-Session**: Support multiple concurrent sessions
4. **Background Refresh**: Automatic session renewal before expiration
