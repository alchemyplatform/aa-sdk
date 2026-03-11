# @alchemy/wallet-apis

High-level viem-style client for Alchemy's Smart Wallet APIs. Provides EIP-7702 smart wallet support with signing, transaction preparation, and call sending.

## Installation

```bash
npm install @alchemy/wallet-apis @alchemy/common viem
```

## Key Exports

- **`createSmartWalletClient`** - Factory to create a `SmartWalletClient` (viem client extended with smart wallet actions)
- **`alchemyWalletTransport`** - Alchemy transport pre-configured for the Wallet API gateway
- **`smartWalletActions`** - Client decorator attaching all wallet API actions

### Actions

- **Signing** - `signMessage`, `signTypedData`, `prepareSign`, `signPreparedCalls`, `signSignatureRequest`
- **Transactions** - `prepareCalls`, `sendCalls`, `sendPreparedCalls`
- **Account management** - `getCapabilities`, `listAccounts`, `requestAccount`
- **Permissions** - `grantPermissions`

### Experimental (`@alchemy/wallet-apis/experimental`)

- `requestQuoteV0`, `swapActions` - Pre-release swap functionality

## License

MIT
