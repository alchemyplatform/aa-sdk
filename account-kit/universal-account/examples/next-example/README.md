# Universal Account Demo

A demo app showcasing the seamless integration of **Alchemy Account Kit** with **Particle Network Universal Accounts**.

## What This Demo Shows

- **Alchemy Account Kit Authentication**: Email, passkey, social login, and external wallet support
- **Universal Account Integration**: Automatic initialization from Alchemy's EOA
- **Unified Balance**: View aggregated balance across 15+ EVM chains and Solana
- **Cross-Chain Transactions**: Mint an NFT on Avalanche without holding AVAX

---

## 📖 Understanding the Code

To understand how this integration works, read the files in this order:

### 1. `config.ts` - Configuration
Start here to see how both Alchemy Account Kit and Particle Universal Accounts are configured.
- Sets up Alchemy for authentication (email, passkey, social, wallet)
- Sets up Particle credentials for Universal Accounts

### 2. `app/providers.tsx` - Provider Hierarchy
See how the providers are nested (order matters!):
- `QueryClientProvider` → React Query
- `AlchemyAccountProvider` → Authentication & signing
- `UniversalAccountProvider` → Chain abstraction (must be inside Alchemy provider)

### 3. `app/page.tsx` - Main Page
Learn the key concept of EOA vs SCA:
- `useUser().address` → EOA (what Universal Accounts needs)
- `useAccount().address` → SCA (Alchemy's smart account, NOT used here)
- How to pass the EOA to the Universal Account component

### 4. `app/components/UniversalAccountDemo.tsx` - The Integration
The main component showing all the hooks in action:
- **Step 1**: Get Alchemy signer with `useSigner()`
- **Step 2**: Initialize Universal Account with `useUniversalAccount(ownerAddress)`
- **Step 3**: Get unified balance with `useUnifiedBalance()`
- **Step 4**: Setup transactions with `useSendTransaction()`
- **Step 5**: Example transaction (NFT mint on Avalanche)

---

## Architecture

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

**Key Concept**: We use Alchemy for authentication (getting the EOA), then Universal Accounts for cross-chain operations. The EOA from `useUser().address` is what controls the Universal Account.

---

## Setup

### 1. Get Alchemy Credentials

1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com)
2. Create an app and copy the API Key
3. Go to [Smart Wallets Configuration](https://dashboard.alchemy.com/services/smart-wallets/configuration) and enable login methods (email, passkey, social)
4. (Optional) Create a [Gas Manager Policy](https://dashboard.alchemy.com/services/gas-manager/configuration) for sponsored transactions

### 2. Get Particle Network Credentials

1. Go to [Particle Dashboard](https://dashboard.particle.network)
2. Create a project and web application
3. Copy your **Project ID**, **Client Key**, and **App ID**

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Alchemy Account Kit
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_ALCHEMY_POLICY_ID=your_gas_policy_id  # Optional

# Particle Network Universal Accounts
NEXT_PUBLIC_PARTICLE_PROJECT_ID=your_particle_project_id
NEXT_PUBLIC_PARTICLE_CLIENT_KEY=your_particle_client_key
NEXT_PUBLIC_PARTICLE_APP_ID=your_particle_app_id
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

---

## Code Walkthrough

### Provider Setup (`providers.tsx`)

The app wraps with both Alchemy and Universal Account providers:

```tsx
import { AlchemyAccountProvider } from "@account-kit/react";
import { UniversalAccountProvider } from "@account-kit/universal-account";

export function Providers({ children }) {
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

### Getting the EOA Address (`page.tsx`)

**Important**: Use `user.address` (EOA), not the SCA from `useAccount()`:

```tsx
import { useUser, useAccount } from "@account-kit/react";

function Home() {
  const user = useUser();
  
  // ✅ CORRECT: EOA address for Universal Accounts
  const eoaAddress = user?.address as `0x${string}`;
  
  // ❌ WRONG: This is Alchemy's Smart Contract Account
  // const { address } = useAccount({ type: "LightAccount" });
  
  return <UniversalAccountDemo eoaAddress={eoaAddress} />;
}
```

### Using Universal Account Hooks (`UniversalAccountDemo.tsx`)

```tsx
import { 
  useUniversalAccount, 
  useUnifiedBalance, 
  useSendTransaction 
} from "@account-kit/universal-account";
import { useSigner } from "@account-kit/react";
import { toBytes, encodeFunctionData } from "viem";

function UniversalAccountDemo({ eoaAddress }) {
  const signer = useSigner();

  // 1. Initialize Universal Account with EOA
  const { address, solanaAddress, isReady, error } = useUniversalAccount(eoaAddress);

  // 2. Get unified balance across all chains
  const { totalBalanceUSD, assets, refetch } = useUnifiedBalance();

  // 3. Set up transaction sending
  const { sendUniversal, isLoading } = useSendTransaction({
    signMessage: async (message) => {
      // Sign raw bytes of the transaction hash
      return await signer!.signMessage({ raw: toBytes(message) });
    },
  });

  // 4. Send a cross-chain transaction
  const handleMint = async () => {
    const result = await sendUniversal({
      chainId: 43114, // Avalanche
      expectTokens: [],
      transactions: [{
        to: "0xdea7bF60E53CD578e3526F36eC431795f7EEbFe6",
        data: encodeFunctionData({
          abi: [{ type: "function", name: "mint", inputs: [], outputs: [] }],
          functionName: "mint",
        }),
      }],
    });
    
    console.log("View TX:", `https://universalx.app/activity/details?id=${result.transactionId}`);
  };

  return (
    <div>
      <p>EVM Address: {address}</p>
      <p>Solana Address: {solanaAddress}</p>
      <p>Balance: ${totalBalanceUSD?.toFixed(2)}</p>
      <button onClick={handleMint} disabled={isLoading}>
        Mint NFT on Avalanche
      </button>
    </div>
  );
}
```

---

## Available Hooks

| Hook | Purpose |
|------|---------|
| `useUniversalAccount(ownerAddress)` | Initialize UA with EOA, get addresses |
| `useUnifiedBalance()` | Get aggregated balance across all chains |
| `useSendTransaction({ signMessage })` | Send cross-chain transactions |
| `useUniversalAccountContext()` | Access raw context for advanced use |

### Transaction Types

The `useSendTransaction` hook provides methods for all Universal Account transaction types:

| Method | Description |
|--------|-------------|
| `sendTransfer` | Send tokens to any address across chains |
| `sendUniversal` | Execute custom contract interactions |
| `sendBuy` | Buy/swap into a target token using USD value |
| `sendSell` | Sell a token back into primary assets |
| `sendConvert` | Convert between primary assets on a chain |

```tsx
const { sendTransfer, sendBuy, sendSell, sendConvert, sendUniversal } = useSendTransaction({
  signMessage: async (msg) => signer!.signMessage({ raw: toBytes(msg) }),
});

// Transfer tokens
await sendTransfer({ token: { chainId: 42161, address: "0x..." }, amount: "10", receiver: "0x..." });

// Buy $10 worth of a token
await sendBuy({ token: { chainId: 42161, address: "0x..." }, amountInUSD: "10" });

// Sell tokens
await sendSell({ token: { chainId: 42161, address: "0x..." }, amount: "0.1" });

// Convert to USDC on Arbitrum
await sendConvert({ expectToken: { type: "USDC", amount: "1" }, chainId: 42161 });

// Custom contract call
await sendUniversal({ chainId: 43114, expectTokens: [], transactions: [{ to: "0x...", data: "0x..." }] });
```

See the [SDK README](../../README.md) for full API documentation.

---

## How It Works

1. **Sign In**: User authenticates with Alchemy Account Kit (email, passkey, social, or wallet)
2. **Get EOA**: Alchemy provides the EOA address via `useUser().address`
3. **Initialize UA**: The EOA is passed to `useUniversalAccount()` which creates the Universal Account
4. **Unified Balance**: `useUnifiedBalance()` fetches aggregated assets across all chains
5. **Transactions**: `useSendTransaction()` creates and signs cross-chain transactions

---

## Resources

- [SDK Documentation](../../README.md) - Full API reference
- [Alchemy Account Kit Docs](https://www.alchemy.com/docs/wallets)
- [Particle Network Universal Accounts](https://developers.particle.network/universal-accounts/cha/overview)
- [Supported Chains](https://developers.particle.network/universal-accounts/cha/chains)
- [UniversalX Explorer](https://universalx.app)
