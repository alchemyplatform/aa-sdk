# @account-kit/universal-account

Universal Account integration for Alchemy Account Kit, enabling chain abstraction with [Particle Network's Universal Accounts](https://developers.particle.network/universal-accounts/cha/overview).

## Overview

Universal Accounts provide users with a single account, balance, and interaction point across all supported chains (EVM + Solana). This package seamlessly integrates Universal Accounts into Alchemy Account Kit.

### Key Features

- **Seamless Integration**: Works naturally with Account Kit's authentication
- **Unified Balance**: View and use assets across all chains as a single balance
- **Cross-Chain Transactions**: Send transactions to any chain without manual bridging
- **Universal Gas**: Pay gas fees with any supported token

## Installation

```bash
yarn add @account-kit/universal-account

# or with npm
npm install @account-kit/universal-account
```

## Prerequisites

You'll need credentials from both dashboards:

**Alchemy** (for authentication):

- Get your API key from [Alchemy Dashboard](https://dashboard.alchemy.com)

**Particle Network** (for Universal Accounts):

1. Sign up at [Particle Dashboard](https://dashboard.particle.network/)
2. Create a project and web application
3. Copy your **Project ID**, **Client Key**, and **App ID**

## Understanding the Architecture

When integrating Alchemy Account Kit with Universal Accounts, it's important to understand the different account types:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Alchemy Account Kit                          │
├─────────────────────────────────────────────────────────────────┤
│  useUser()     → user.address = EOA (Externally Owned Account) │
│  useAccount()  → address = SCA (Smart Contract Account)        │
│  useSigner()   → Signs messages with the EOA                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ EOA address (user.address)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Universal Accounts                             │
├─────────────────────────────────────────────────────────────────┤
│  Owner: EOA from Alchemy (user.address)                        │
│  Creates: Multi-chain smart accounts (EVM + Solana)            │
│  Provides: Unified balance, cross-chain transactions           │
└─────────────────────────────────────────────────────────────────┘
```

**Key Concept**: Alchemy's SCA and Universal Account's smart accounts are **different**!

- Use Alchemy for authentication and getting the EOA
- Use Universal Accounts for cross-chain operations

## Quick Start

### 1. Set Up Providers

Wrap your app with both `AlchemyAccountProvider` and `UniversalAccountProvider`:

```tsx
// providers.tsx
"use client";

import { AlchemyAccountProvider } from "@account-kit/react";
import { UniversalAccountProvider } from "@account-kit/universal-account";
import { QueryClientProvider } from "@tanstack/react-query";
import { config, queryClient, universalAccountConfig } from "./config";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider config={config} queryClient={queryClient}>
        <UniversalAccountProvider config={universalAccountConfig}>
          {children}
        </UniversalAccountProvider>
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
}
```

```tsx
// config.ts
import { createConfig, cookieStorage } from "@account-kit/react";
import { mainnet, alchemy } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

export const config = createConfig({
  transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
  chain: mainnet,
  ssr: true,
  storage: cookieStorage,
});

export const queryClient = new QueryClient();

export const universalAccountConfig = {
  projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
  clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
  appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
};
```

### 2. Get the EOA Address

**Important**: Use `user.address` (EOA) from `useUser()`, not the SCA from `useAccount()`:

```tsx
import { useUser, useSigner } from "@account-kit/react";

function MyComponent() {
  const user = useUser();
  const signer = useSigner();

  // ✅ CORRECT: Use EOA for Universal Accounts
  const eoaAddress = user?.address as `0x${string}` | undefined;

  // ❌ WRONG: Don't use SCA for Universal Accounts
  // const { address } = useAccount({ type: "LightAccount" });

  return <UniversalAccountDemo ownerAddress={eoaAddress} />;
}
```

### 3. Initialize Universal Account

The `useUniversalAccount` hook auto-initializes when you pass the EOA address:

```tsx
import { useUser, useSigner } from "@account-kit/react";
import {
  useUniversalAccount,
  useUnifiedBalance,
} from "@account-kit/universal-account";

function Dashboard() {
  const user = useUser();
  const eoaAddress = user?.address as `0x${string}` | undefined;

  // Universal Account auto-initializes with the EOA address
  const {
    address, // Universal Account EVM address
    solanaAddress, // Universal Account Solana address
    isReady,
    isInitializing,
    error,
  } = useUniversalAccount(eoaAddress);

  // Get unified balance across all chains
  const { totalBalanceUSD, assets, isLoading, refetch } = useUnifiedBalance();

  if (isInitializing) return <div>Initializing Universal Account...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isReady) return null;

  return (
    <div>
      <h2>Universal Account</h2>
      <p>EVM Address: {address}</p>
      <p>Solana Address: {solanaAddress}</p>

      <h3>Unified Balance: ${totalBalanceUSD?.toFixed(2)}</h3>
      {assets?.map((asset) => (
        <div key={asset.tokenType}>
          {asset.tokenType}: {asset.amount} (${asset.amountInUSD.toFixed(2)})
        </div>
      ))}

      <button onClick={refetch} disabled={isLoading}>
        {isLoading ? "Loading..." : "Refresh Balance"}
      </button>
    </div>
  );
}
```

### 4. Send Transactions

Use `useSendTransaction` to send cross-chain transactions:

```tsx
import { useUser, useSigner } from "@account-kit/react";
import { useSendTransaction } from "@account-kit/universal-account";
import { toBytes, encodeFunctionData } from "viem";

function MintNFT() {
  const signer = useSigner();

  const { sendUniversal, isLoading, error, lastResult } = useSendTransaction({
    signMessage: async (message: string) => {
      if (!signer) throw new Error("Signer not available");
      // Sign the raw hash bytes
      return await signer.signMessage({ raw: toBytes(message) });
    },
  });

  const handleMint = async () => {
    const NFT_CONTRACT = "0xdea7bF60E53CD578e3526F36eC431795f7EEbFe6";
    const AVALANCHE_CHAIN_ID = 43114;

    const mintData = encodeFunctionData({
      abi: [{ type: "function", name: "mint", inputs: [], outputs: [] }],
      functionName: "mint",
    });

    const result = await sendUniversal({
      chainId: AVALANCHE_CHAIN_ID,
      expectTokens: [], // No tokens needed for free mint
      transactions: [
        {
          to: NFT_CONTRACT,
          data: mintData,
        },
      ],
    });

    console.log("Transaction ID:", result.transactionId);
    console.log(
      "View on UniversalX:",
      `https://universalx.app/activity/details?id=${result.transactionId}`,
    );
  };

  return (
    <div>
      <button onClick={handleMint} disabled={isLoading || !signer}>
        {isLoading ? "Minting..." : "Mint NFT on Avalanche"}
      </button>
      {lastResult && (
        <a
          href={`https://universalx.app/activity/details?id=${lastResult.transactionId}`}
        >
          View Transaction
        </a>
      )}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

---

## API Reference

### Constants

The package exports helpful constants for chain IDs and token types:

```typescript
import {
  CHAIN_ID,
  TOKEN_TYPE,
  NATIVE_TOKEN_ADDRESS,
} from "@account-kit/universal-account";

// Use chain IDs
const tx = await sendUniversal({
  chainId: CHAIN_ID.AVALANCHE, // 43114
  // ...
});

// Available chains:
CHAIN_ID.ETHEREUM; // 1
CHAIN_ID.BNB_CHAIN; // 56
CHAIN_ID.BASE; // 8453
CHAIN_ID.ARBITRUM; // 42161
CHAIN_ID.AVALANCHE; // 43114
CHAIN_ID.OPTIMISM; // 10
CHAIN_ID.POLYGON; // 137
CHAIN_ID.LINEA; // 59144
CHAIN_ID.BERACHAIN; // 80094
CHAIN_ID.SOLANA; // 101
// ... and more

// Token types for expectTokens
TOKEN_TYPE.ETH;
TOKEN_TYPE.USDC;
TOKEN_TYPE.USDT;
TOKEN_TYPE.SOL;

// Native token address (for ETH, AVAX, etc.)
NATIVE_TOKEN_ADDRESS; // "0x0000000000000000000000000000000000000000"
```

---

### Provider

#### `UniversalAccountProvider`

Wrap your app to enable Universal Account functionality. Must be nested inside `AlchemyAccountProvider`.

```tsx
<UniversalAccountProvider
  config={{
    projectId: string;      // Particle project ID
    clientKey: string;      // Particle client key
    appId: string;          // Particle app ID
    tradeConfig?: {
      slippageBps?: number;   // Slippage in basis points (100 = 1%)
      universalGas?: boolean; // Use PARTI token for gas
    };
  }}
>
  {children}
</UniversalAccountProvider>
```

---

### Hooks

#### `useUniversalAccount(ownerAddress?)`

Initialize and manage a Universal Account. Auto-initializes when `ownerAddress` is provided.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ownerAddress` | `Address \| undefined` | The EOA address from `useUser().address` |

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `client` | `UniversalAccountClient \| null` | The UA client instance |
| `address` | `Address \| null` | Universal Account EVM address |
| `solanaAddress` | `string \| null` | Universal Account Solana address |
| `isReady` | `boolean` | True when UA is initialized and ready |
| `isInitializing` | `boolean` | True during initialization |
| `error` | `Error \| null` | Any initialization error |
| `initialize` | `(ownerAddress: Address) => Promise<void>` | Manual initialization |
| `disconnect` | `() => void` | Reset the Universal Account |

**Example:**

```tsx
const user = useUser();
const { address, solanaAddress, isReady, error } = useUniversalAccount(
  user?.address as `0x${string}`,
);
```

---

#### `useUnifiedBalance(options?)`

Fetch the unified balance across all chains. Automatically fetches when the Universal Account is ready.

**Parameters:**
| Option | Type | Description |
|--------|------|-------------|
| `refetchInterval` | `number` | Auto-refresh interval in milliseconds |

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `balance` | `PrimaryAssets \| null` | Full balance object |
| `totalBalanceUSD` | `number \| null` | Total balance in USD |
| `assets` | `AssetInfo[] \| null` | Array of individual assets |
| `isLoading` | `boolean` | True while fetching |
| `error` | `Error \| null` | Any fetch error |
| `refetch` | `() => void` | Manually refresh balance |

**Asset Structure:**

```typescript
interface AssetInfo {
  tokenType: string; // e.g., "USDT", "ETH"
  price: number; // Current price in USD
  amount: string; // Total amount across chains
  amountInUSD: number; // Total value in USD
  chainAggregation: {
    // Breakdown by chain
    chainId: number;
    address: string;
    amount: string;
    amountInUSD: number;
  }[];
}
```

**Example:**

```tsx
const { totalBalanceUSD, assets, refetch, isLoading } = useUnifiedBalance({
  refetchInterval: 30000, // Refresh every 30 seconds
});
```

---

#### `useSendTransaction(options)`

Send Universal Account transactions with automatic signing flow. Supports all transaction types:

**Parameters:**
| Option | Type | Description |
|--------|------|-------------|
| `signMessage` | `(message: string) => Promise<string>` | Function to sign the transaction hash |

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `sendTransfer` | `(params) => Promise<TransactionResult>` | Send a token transfer |
| `sendUniversal` | `(params) => Promise<TransactionResult>` | Send a custom contract interaction |
| `sendBuy` | `(params) => Promise<TransactionResult>` | Buy/swap into a target token |
| `sendSell` | `(params) => Promise<TransactionResult>` | Sell a token back to primary assets |
| `sendConvert` | `(params) => Promise<TransactionResult>` | Convert between primary assets |
| `isLoading` | `boolean` | True while transaction is pending |
| `error` | `Error \| null` | Any transaction error |
| `lastResult` | `TransactionResult \| null` | Result of last transaction |
| `isReady` | `boolean` | True when ready to send |

**Transaction Types:**

##### `sendTransfer` - Token Transfer

Send tokens to any address across chains.

```typescript
await sendTransfer({
  token: {
    chainId: 42161, // Arbitrum
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
  },
  amount: "10", // Human-readable amount
  receiver: "0x...", // Recipient address
});
```

##### `sendUniversal` - Custom Contract Interaction

Execute any contract call with automatic liquidity routing.

```typescript
await sendUniversal({
  chainId: 8453,        // Base
  expectTokens: [       // Tokens needed (for payable functions)
    { type: "ETH", amount: "0.0001" },
  ],
  transactions: [{
    to: "0x...",
    data: encodeFunctionData({ ... }),
    value: "0x...",     // Optional: for payable functions
  }],
});
```

##### `sendBuy` - Buy/Swap Token

Buy a token using USD value from your primary assets.

```typescript
await sendBuy({
  token: {
    chainId: 42161, // Arbitrum
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
  },
  amountInUSD: "10", // Spend $10 worth of primary assets
});
```

##### `sendSell` - Sell Token

Sell a token back into primary assets.

```typescript
await sendSell({
  token: {
    chainId: 42161, // Arbitrum
    address: "0x912CE59144191C1204E64559FE8253a0e49E6548", // ARB
  },
  amount: "0.1", // Sell 0.1 ARB
});
```

##### `sendConvert` - Convert Primary Assets

Convert between primary assets on a specific chain.

```typescript
await sendConvert({
  expectToken: { type: "USDC", amount: "1" },
  chainId: 42161, // Arbitrum
});
```

**Solana Support:**
All transaction types work with Solana. Use chain ID for Solana mainnet and the appropriate token addresses:

```typescript
// Buy SOL or Solana tokens
await sendBuy({
  token: {
    chainId: 1399811149, // Solana mainnet
    address: "0x0000000000000000000000000000000000000000", // Native SOL
  },
  amountInUSD: "1",
});
```

**Full Example:**

```tsx
const signer = useSigner();

const { sendTransfer, sendBuy, sendUniversal, isLoading } = useSendTransaction({
  signMessage: async (message) => {
    return await signer!.signMessage({ raw: toBytes(message) });
  },
});

// Mint NFT on Avalanche
await sendUniversal({
  chainId: 43114,
  expectTokens: [],
  transactions: [
    {
      to: "0xdea7bF60E53CD578e3526F36eC431795f7EEbFe6",
      data: encodeFunctionData({
        abi: [{ type: "function", name: "mint", inputs: [], outputs: [] }],
        functionName: "mint",
      }),
    },
  ],
});
```

---

#### `useUniversalAccountContext()`

Access the raw Universal Account context. Useful for advanced use cases.

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `client` | `UniversalAccountClient \| null` | The UA client instance |
| `config` | `UniversalAccountProviderConfig` | Provider configuration |
| `isReady` | `boolean` | True when initialized |
| `isInitializing` | `boolean` | True during initialization |
| `error` | `Error \| null` | Any error |
| `address` | `Address \| null` | EVM address |
| `solanaAddress` | `string \| null` | Solana address |
| `initialize` | `(ownerAddress: Address) => Promise<void>` | Initialize UA |
| `disconnect` | `() => void` | Reset UA |

---

### Client (Advanced)

For manual control without React hooks, use `createUniversalAccountClient`:

```typescript
import { createUniversalAccountClient } from "@account-kit/universal-account";

const client = await createUniversalAccountClient({
  ownerAddress: "0x...",
  config: {
    projectId: "...",
    projectClientKey: "...",
    projectAppUuid: "...",
  },
});

// Get addresses
const evmAddress = await client.getAddress();
const solanaAddress = await client.getSolanaAddress();

// Get balance
const balance = await client.getPrimaryAssets();
console.log("Total USD:", balance.totalAmountInUSD);

// Create and send transaction
const tx = await client.createUniversalTransaction({
  chainId: 43114,
  expectTokens: [],
  transactions: [{ to: "0x...", data: "0x..." }],
});

const signature = await signer.signMessage({ raw: toBytes(tx.rootHash) });
const result = await client.sendTransaction(tx, signature);

console.log("Explorer:", client.getExplorerUrl(result.transactionId));
```

---

## How Universal Accounts Work

1. **Single Owner**: A Universal Account is controlled by a single EOA (your Alchemy Signer)
2. **Multiple Addresses**: Each UA has both an EVM address and a Solana address
3. **Unified Balance**: Assets across all chains are aggregated into a single balance view
4. **Automatic Routing**: When you send a transaction, the SDK automatically:
   - Finds the optimal source of funds across your chains
   - Routes liquidity through Particle's Universal Liquidity
   - Handles all bridging and gas abstraction

## Supported Chains

Universal Accounts support 15+ EVM chains and Solana:

- Ethereum, Base, Arbitrum, Optimism, Polygon
- Avalanche, BNB Chain, Fantom, Gnosis
- And more...

See the [full list of supported chains](https://developers.particle.network/universal-accounts/cha/chains).

## Fees

Universal Account transactions may include:

- **Gas fees**: Standard network fees on the destination chain
- **LP fee**: 0.2% for cross-chain transactions
- **Service fee**: 1% on transaction volume

Fees are automatically calculated and shown in the transaction preview via `feeQuotes`.

## Testing

### Run Tests

```bash
# Run all tests
yarn test

# Run tests once (CI mode)
yarn test:run
```

### Test Coverage

The package includes two types of testing:

**Unit Tests** (`src/__tests__/`)

- `constants.test.ts` - Verifies exported chain IDs, token types, and constants
- `client.test.ts` - Tests the `UniversalAccountClient` wrapper logic using mocks

Unit tests verify that:

- Parameters are correctly passed to the underlying Particle SDK
- Responses are correctly mapped to our TypeScript types
- The client API behaves as expected

**Integration Testing** (`examples/next-example/`)

For full integration testing with real SDK calls, use the demo app:

```bash
cd examples/next-example
yarn install
yarn dev
```

This tests the complete flow: authentication → Universal Account initialization → balance fetching → transaction signing.

## Resources

- [Particle Network Documentation](https://developers.particle.network/universal-accounts/cha/overview)
- [Universal Accounts SDK Reference](https://developers.particle.network/universal-accounts/ua-reference/desktop/web)
- [Supported Chains & Primary Assets](https://developers.particle.network/universal-accounts/cha/chains)

