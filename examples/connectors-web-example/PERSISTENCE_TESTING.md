# Testing Auth Session Persistence

This connectors-web-example now includes comprehensive testing utilities for the auth session persistence functionality implemented in the alchemyAuth connector.

## What's Been Added

### 🧪 Storage & Persistence Testing Section

The example now includes a new testing section at the bottom of the page with the following features:

1. **Mock Session Injection**: Simulate stored auth sessions without going through the real auth flow
2. **Resume Testing**: Test the `isAuthorized()` and reconnect functionality
3. **Storage Inspection**: View current storage contents in real-time
4. **Expiration Testing**: Test how expired sessions are handled
5. **Cross-Tab Testing**: Verify multi-tab session synchronization

## How to Run the Tests

### 1. Start the Development Server

```bash
cd examples/connectors-web-example
npm install
npm run dev
```

Open your browser to the development URL (usually `http://localhost:5173`)

### 2. Basic Persistence Test

1. **Inject Mock Session**: Click "Inject Mock Email Session"
   - This stores a mock encrypted session bundle in localStorage
   - Check the "Current Storage Contents" to see the stored data

2. **Test Reload Behavior**:
   - Refresh the page (F5)
   - Open browser DevTools and check the Console
   - You should see: `"Using mock loadAuthSessionState - replace with real SDK method"`
   - The connector attempts to restore but fails gracefully due to mock implementation

3. **Manual Resume Test**:
   - Click "Test Resume (isAuthorized)" to manually trigger the resume logic
   - Check console for detailed logs about the restore attempt

### 3. Expiration Handling Test

1. Click "Inject Expired Session" - this creates a session that expired 1 hour ago
2. Click "Test Resume" - the connector should:
   - Detect the expired session
   - Clean up the storage automatically
   - Return `false` from `isAuthorized()`
3. Check that "Current Storage Contents" shows the storage was cleared

### 4. Cross-Tab Synchronization Test

1. **Setup**: Inject a mock session in the current tab
2. **Open Second Tab**: Open the same app URL in a new tab
3. **Test Sync**: In one tab, click "Force Disconnect & Clear Session"
4. **Verify**: The other tab should automatically disconnect due to the storage event listener

### 5. Storage Migration Test

The connector includes version migration support. To test:

1. Manually inject legacy data via browser DevTools:
   ```javascript
   localStorage.setItem('wagmi.alchemyAuth.authSession', JSON.stringify({
     // Old format without version
     type: 'email',
     bundle: 'old-format-bundle',
     expirationDateMs: Date.now() + 3600000,
     chainId: 1,
     user: { userId: 'test', address: '0x123...' }
   }))
   ```

2. Click "Test Resume" - the connector should migrate the data to v1 format

## What to Expect (Current Mock Behavior)

Since the real SDK methods from PR #2039 haven't been integrated yet:

### ✅ Working Features:
- **Storage Operations**: Write, read, clear work correctly
- **Expiration Logic**: Expired sessions are detected and cleaned up
- **Cross-Tab Sync**: Storage events trigger disconnection across tabs
- **Version Migration**: Old data formats are migrated to v1
- **Race Condition Prevention**: Multiple `isAuthorized()` calls are deduplicated

### ⚠️ Mock Limitations:
- **Restore Always Fails**: `loadAuthSessionState()` throws an error (mock implementation)
- **No Actual Authentication**: Can't test with real auth sessions yet
- **Console Warnings**: You'll see warnings about mock implementations

### Console Output Examples:

**Successful Storage Operations:**
```
Mock email session injected! Try refreshing the page to test resume.
```

**Resume Attempt (Expected to Fail):**
```
Using mock loadAuthSessionState - replace with real SDK method
Skipping session restoration - mock implementation active
Resume failed or no valid session in storage
```

**Expiration Cleanup:**
```
Expired session injected! Try testing resume - it should fail and clean up.
Resume failed or no valid session in storage
```

## When PR #2039 is Merged

Once the real SDK methods are available:

1. **Remove Mock Methods**: Delete the mock implementation functions
2. **Update Imports**: Import the real `AuthSessionState` type
3. **Test Real Restoration**: The resume functionality should work end-to-end
4. **Validate Passkey Flow**: Ensure passkey sessions don't trigger unwanted WebAuthn prompts

## Storage Format

The persisted session data follows this structure:

```typescript
// Email/OAuth/OTP sessions
{
  v: 1,
  type: "email" | "oauth" | "otp",
  bundle: "encrypted-bundle-string",
  expirationDateMs: 1234567890000,
  chainId: 1,
  user: {
    userId: "user-id",
    address: "0x..."
  }
}

// Passkey sessions (no bundle)
{
  v: 1,
  type: "passkey",
  expirationDateMs: 1234567890000,
  chainId: 1,
  user: {
    userId: "user-id",
    address: "0x..."
  }
}
```

## Architecture Overview

The persistence system implements:

- **wagmi Storage Integration**: Uses `config.storage` for cross-connector compatibility
- **Minimal Data Storage**: Only essential state, no sensitive data
- **Eager Resume**: `isAuthorized()` automatically attempts restore
- **Robust Error Handling**: Graceful failure and cleanup
- **Future-Proof Versioning**: Schema migration support

This provides a solid foundation for production auth session persistence once the real SDK methods are integrated!