# V5 Auth Persistence Implementation Plan

## Overview

Implement auth session persistence for the alchemyAuth wagmi connector using wagmi's native storage abstraction. This enables automatic reconnection across page reloads while maintaining security and handling edge cases.

## Current State

- `alchemyAuth` connector exists with basic lifecycle methods
- `setAuthSession()` and `getAuthSession()` methods implemented
- No persistence - sessions lost on page reload
- `isAuthorized()` only checks in-memory `authSessionInstance`
- Provider implementation in progress (separate PR)

## Implementation Plan

### Phase 1: Core Storage Implementation

#### 1. Define Persisted Data Types

```typescript
// Minimal, versioned, encrypted snapshot for storage
export type PersistedAuthSessionV1 =
  | {
      v: 1;
      type: "email" | "oauth" | "otp";
      bundle: string; // encrypted, opaque
      expirationDateMs: number;
      chainId: number;
      user?: Pick<User, "id" | "address">; // minimal UX hint
    }
  | {
      v: 1;
      type: "passkey";
      expirationDateMs: number;
      chainId: number;
      user?: Pick<User, "id" | "address">;
    };
```

#### 2. Storage Configuration

```typescript
const KEY = "alchemyAuth.authSession" as const;
const SKEW_MS = 10_000; // clock skew tolerance

function withinSkew(expirationDateMs: number): boolean {
  return Date.now() + SKEW_MS < expirationDateMs;
}
```

#### 3. Mock AuthSessionState (until PR #2039 merges)

```typescript
// Mock interface - replace with real SDK types when available
interface MockAuthSessionState {
  type: "email" | "oauth" | "otp" | "passkey";
  bundle?: string; // not present for passkey
  expirationDateMs: number;
  chainId: number;
  user: Pick<User, "id" | "address">;
}

// Mock method on AuthSession - replace with real SDK method
authSession.getState = (): MockAuthSessionState => ({
  type: "email", // mock
  bundle: "encrypted-bundle-data",
  expirationDateMs: Date.now() + 3600000,
  chainId: currentChainId,
  user: { id: authSession.getUser().userId, address: authSession.getAddress() },
});

// Mock method on AuthClient - replace with real SDK method
authClient.loadAuthSessionState = async (
  state: MockAuthSessionState,
  context: { apiKey: string; createTekStamper: any /* etc */ },
): Promise<AuthSession> => {
  // Mock implementation - real SDK will handle this
  throw new Error("Mock implementation - replace with real SDK");
};
```

### Phase 2: Update Connector Methods

#### 1. Enhanced `setAuthSession()` - Persist Immediately

```typescript
setAuthSession(authSession: AuthSession) {
  authSessionInstance = authSession;
  const st = authSession.getState() as MockAuthSessionState;

  const toPersist: PersistedAuthSessionV1 =
    st.type === 'passkey'
      ? {
          v: 1,
          type: 'passkey',
          expirationDateMs: st.expirationDateMs,
          chainId: st.chainId,
          user: st.user
        }
      : {
          v: 1,
          type: st.type,
          bundle: st.bundle!,
          expirationDateMs: st.expirationDateMs,
          chainId: st.chainId,
          user: st.user
        };

  void config.storage?.setItem(KEY, toPersist);
}
```

#### 2. Silent Resume Logic

```typescript
let resumePromise: Promise<boolean> | null = null; // dedupe concurrent calls

async function tryResume(): Promise<boolean> {
  if (authSessionInstance) return true;

  const persisted = (await config.storage?.getItem(
    KEY,
  )) as PersistedAuthSessionV1 | null;
  if (!persisted) return false;

  if (!withinSkew(persisted.expirationDateMs)) {
    await config.storage?.removeItem(KEY);
    return false;
  }

  try {
    const client = getAuthClient(); // existing factory
    authSessionInstance = await client.loadAuthSessionState(
      persisted as any, // SDK expects AuthSessionState-equivalent
      {
        apiKey: options.apiKey!,
        createTekStamper: options.createTekStamper,
        createWebAuthnStamper: options.createWebAuthnStamper,
        iframeElementId: options.iframeElementId,
        iframeContainerId: options.iframeContainerId,
      },
    );
    currentChainId = persisted.chainId;
    return true;
  } catch {
    await config.storage?.removeItem(KEY);
    return false;
  }
}
```

#### 3. Updated `isAuthorized()` - Eager Resume

```typescript
async isAuthorized() {
  if (!resumePromise) {
    resumePromise = tryResume().finally(() => (resumePromise = null));
  }
  return await resumePromise;
}
```

#### 4. Updated `connect()` - Handle Resumed Sessions

```typescript
async connect({ chainId } = {}) {
  // Let isAuthorized handle the resume
  await (resumePromise ?? tryResume());

  if (!authSessionInstance) {
    throw new Error("No signer available. Authenticate first.");
  }

  // Refresh persisted snapshot (e.g., new expiration after token refresh)
  const st = authSessionInstance.getState() as MockAuthSessionState;
  const toPersist: PersistedAuthSessionV1 =
    st.type === 'passkey'
      ? { v: 1, type: 'passkey', expirationDateMs: st.expirationDateMs, chainId: st.chainId, user: st.user }
      : { v: 1, type: st.type, bundle: st.bundle!, expirationDateMs: st.expirationDateMs, chainId: st.chainId, user: st.user };

  await config.storage?.setItem(KEY, toPersist);

  const accounts = await this.getAccounts();
  if (!accounts.length) throw new Error("No accounts.");

  const resolvedChainId = chainId ?? currentChainId ?? config.chains[0]?.id;
  if (!resolvedChainId) throw new Error("No chain ID available.");
  currentChainId = resolvedChainId;

  return { accounts, chainId: resolvedChainId };
}
```

#### 5. Updated `disconnect()` - Clear Storage

```typescript
async disconnect() {
  try {
    if (authSessionInstance) await authSessionInstance.disconnect();
  } catch (error) {
    config.emitter.emit("error", { error: error as Error });
  } finally {
    authSessionInstance = undefined;
    currentChainId = undefined;
    await config.storage?.removeItem(KEY);
  }
}
```

### Phase 3: Cross-Tab and Edge Cases

#### 1. Cross-Tab Storage Events

```typescript
async setup() {
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key?.endsWith(KEY) && e.newValue === null) {
        // Storage cleared elsewhere - disconnect here
        void this.disconnect();
      }
    });
  }
}
```

#### 2. Version Migration Support

```typescript
function migratePersistedState(raw: any): PersistedAuthSessionV1 | null {
  if (!raw || typeof raw !== "object") return null;

  // Handle v1 (current)
  if (raw.v === 1) return raw as PersistedAuthSessionV1;

  // Handle legacy (no version) - migrate to v1
  if (!raw.v && raw.type && raw.expirationDateMs) {
    return { ...raw, v: 1 } as PersistedAuthSessionV1;
  }

  return null; // unknown version
}
```

### Phase 4: Testing Matrix

#### Required Test Cases

- **Login → Reload**: Auto-reconnect true, no prompts
- **Expired State**: Storage cleared, `isAuthorized()` false
- **Passkey Resume**: No WebAuthn prompt in `isAuthorized()`
- **OAuth/Email/OTP**: Resume via bundle injection
- **Cross-Tab**: Disconnect in Tab A clears Tab B
- **Chain Switching**: Persist new chainId, maintain on reload
- **Version Migration**: Handle legacy state formats
- **Race Conditions**: Multiple concurrent `isAuthorized()` calls

#### Mock Testing Setup

```typescript
// Test with localStorage mock
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

const mockConfig = {
  storage: mockStorage,
  chains: [{ id: 1 }],
  emitter: { emit: jest.fn() },
};
```

### Phase 5: Security Checklist

- ✅ No API keys in storage (injected at resume time)
- ✅ Encrypted bundles only (opaque to storage layer)
- ✅ Expiration with clock skew tolerance
- ✅ Clear on failure to prevent retry loops
- ✅ Version field for future migrations
- ✅ Minimal PII in user hints

## Integration Steps

1. **Implement core persistence** (Phase 1-2) with mocks
2. **Add robust error handling** (Phase 3)
3. **Create comprehensive tests** (Phase 4)
4. **Replace mocks** with real SDK methods when PR #2039 merges
5. **Validate passkey flow** doesn't prompt during resume
6. **Deploy and monitor** resume success rates

## Future Enhancements

- **SSR Support**: Cookie-based initial state for Next.js
- **Telemetry**: Track resume success/failure rates
- **Advanced Migration**: Handle complex schema changes
- **Storage Optimization**: Compress large bundles
- **Multi-Account**: Support multiple concurrent sessions

## Dependencies

- **PR #2039**: Provides `AuthSessionState`, `loadAuthSessionState()`, `getState()` methods
- **Provider PR**: EIP-1193 implementation (separate effort)
- **Passkey Testing**: Ensure no unwanted WebAuthn prompts during resume
