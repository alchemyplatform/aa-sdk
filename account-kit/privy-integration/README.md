# @account-kit/privy-integration

Add gas sponsorship and smart wallet features to your Privy app in under 5 minutes.

## What This Package Does

If you're already using [Privy](https://privy.io) for authentication, this package lets you upgrade your users' wallets with:

- **🔄 EIP-7702 Delegation** - Upgrade your wallets to smart accounts without migration
- **⛽ Gas Sponsorship** - Pay gas fees for your users via Alchemy Gas Manager (EVM & Solana)
- **💱 Token Swaps** - Execute swaps through Alchemy's swap infrastructure
- **🚀 Batched Transactions** - Send multiple operations in a single transaction using `sendTransaction([...])`
- **☀️ Solana Support** - Send sponsored Solana transactions with Privy's embedded Solana wallets

All while keeping Privy as your authentication provider. No need to change your auth flow or migrate user accounts.

## Why Use This?

**Already using Privy?** Add smart account features without changing your existing setup:

- Drop-in React hooks that replace Privy's transaction hooks
- Automatic EIP-7702 delegation to upgrade wallets on-the-fly
- Route transactions through Alchemy's infrastructure for sponsorship and reliability

## Installation

```bash
npm install @account-kit/privy-integration
# or
yarn add @account-kit/privy-integration
# or
pnpm add @account-kit/privy-integration
```

### Optional: Solana Support

To use Solana features (like `useAlchemySolanaTransaction`), you'll need to install the Solana Web3.js library:

```bash
npm install @solana/web3.js
# or
yarn add @solana/web3.js
# or
pnpm add @solana/web3.js
```

Then import from the `/solana` export:

```tsx
import { useAlchemySolanaTransaction } from "@account-kit/privy-integration/solana";
```

> **Note:** The Solana functionality is completely optional. If you only need EVM features, you don't need to install `@solana/web3.js`.

## Quick Start

### 1. Wrap Your App with Both Providers

**Important:** `AlchemyProvider` must be nested **inside** `PrivyProvider` to access authentication state.

```tsx
import { PrivyProvider } from "@privy-io/react-auth";
import { AlchemyProvider } from "@account-kit/privy-integration";

function App() {
  return (
    <PrivyProvider
      appId="your-privy-app-id"
      config={
        {
          /* your privy config */
        }
      }
    >
      <AlchemyProvider
        apiKey="your-alchemy-api-key"
        policyId="your-gas-policy-id" // optional, for gas sponsorship
      >
        <YourApp />
      </AlchemyProvider>
    </PrivyProvider>
  );
}
```

### 2. Send Gasless Transactions

```tsx
import { useAlchemySendTransaction } from "@account-kit/privy-integration";

function SendButton() {
  const { sendTransaction, isLoading, error, data } =
    useAlchemySendTransaction();

  const handleSend = async () => {
    try {
      // Single transaction
      const result = await sendTransaction({
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        data: "0x...",
        value: "1000000000000000000", // 1 ETH
      });

      console.log("Transaction hash:", result.txnHash);
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  const handleBatch = async () => {
    try {
      // Batch transactions
      const result = await sendTransaction([
        { to: "0x...", data: "0x...", value: "1000000000000000000" },
        { to: "0x...", data: "0x..." },
        { to: "0x...", data: "0x..." },
      ]);

      console.log("Batch transaction hash:", result.txnHash);
    } catch (err) {
      console.error("Batch transaction failed:", err);
    }
  };

  return (
    <>
      <button onClick={handleSend} disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Transaction"}
      </button>
      <button onClick={handleBatch} disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Batch"}
      </button>
    </>
  );
}
```

### 3. Execute Token Swaps

```tsx
import {
  useAlchemyPrepareSwap,
  useAlchemySubmitSwap,
} from "@account-kit/privy-integration";

function SwapButton() {
  const { prepareSwap } = useAlchemyPrepareSwap();
  const { submitSwap, isLoading } = useAlchemySubmitSwap();

  const handleSwap = async () => {
    try {
      // Step 1: Get quote and prepare swap
      // Two modes available:

      // Option A: Specify exact amount to swap FROM
      const preparedSwap = await prepareSwap({
        fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
        toToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        fromAmount: "0xde0b6b3a7640000", // Swap exactly 1 ETH
      });

      // Option B: Specify minimum amount to receive TO
      /* const preparedSwap = await prepareSwap({
        fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
        toToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        minimumToAmount: "0x5f5e100", // Receive at least 100 USDC (6 decimals)
      }); */

      console.log(
        "Quote expiry:",
        new Date(parseInt(preparedSwap.quote.expiry) * 1000),
      );

      // Step 2: Execute swap
      const result = await submitSwap(preparedSwap);
      console.log("Swap confirmed:", result.txnHash);
    } catch (err) {
      console.error("Swap failed:", err);
    }
  };

  return (
    <button onClick={handleSwap} disabled={isLoading}>
      {isLoading ? "Swapping..." : "Swap Tokens"}
    </button>
  );
}
```

### 4. Send Solana Transactions

```tsx
import { useAlchemySolanaTransaction } from "@account-kit/privy-integration/solana";

function SolanaSendButton() {
  const { sendTransactionAsync, isPending, error, data } =
    useAlchemySolanaTransaction({
      rpcUrl: "https://solana-mainnet.g.alchemy.com/v2/your-api-key",
      policyId: "your-solana-policy-id", // optional, for gas sponsorship
    });

  const handleTransfer = async () => {
    try {
      // Simple SOL transfer
      const result = await sendTransactionAsync({
        transfer: {
          amount: 1_000_000_000, // 1 SOL in lamports
          toAddress: "recipient-base58-address",
        },
      });

      console.log("Transaction hash:", result.hash);
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  const handleCustomInstructions = async () => {
    try {
      // Custom instructions
      import { SystemProgram, PublicKey } from "@solana/web3.js";

      const instruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(walletAddress),
        toPubkey: new PublicKey(recipientAddress),
        lamports: 1_000_000,
      });

      const result = await sendTransactionAsync({
        instructions: [instruction],
      });

      console.log("Transaction hash:", result.hash);
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  return (
    <>
      <button onClick={handleTransfer} disabled={isPending}>
        {isPending ? "Sending..." : "Send SOL"}
      </button>
      <button onClick={handleCustomInstructions} disabled={isPending}>
        {isPending ? "Sending..." : "Custom Instructions"}
      </button>
    </>
  );
}
```

## Configuration

### AlchemyProvider Props

| Prop                 | Type                   | Required      | Description                                                                                              |
| -------------------- | ---------------------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| `apiKey`             | `string`               | Conditional\* | Your Alchemy API key for @account-kit/infra transport                                                    |
| `jwt`                | `string`               | Conditional\* | JWT token for authentication (alternative to `apiKey`)                                                   |
| `rpcUrl`             | `string`               | Conditional\* | Custom RPC URL for EVM chains (can be used alone or with `jwt`)                                          |
| `solanaRpcUrl`       | `string`               | No            | Custom RPC URL for Solana (separate from EVM `rpcUrl`)                                                   |
| `policyId`           | `string \| string[]`   | No            | Gas Manager policy ID(s) for EVM sponsorship. If array is provided, backend uses first applicable policy |
| `solanaPolicyId`     | `string \| string[]`   | No            | Gas Manager policy ID(s) for Solana sponsorship                                                          |
| `disableSponsorship` | `boolean`              | No            | Set to `true` to disable gas sponsorship by default (default: `false`)                                   |
| `accountAuthMode`    | `'eip7702' \| 'owner'` | No            | Authorization mode for EVM smart accounts (default: `'eip7702'`)                                         |

\* **Required configuration (pick one):**

- `apiKey` alone
- `jwt` alone
- `rpcUrl` alone
- `rpcUrl` + `jwt` together

### Transaction Options

Control sponsorship per transaction:

```tsx
// Sponsored transaction (default if policyId is set and disableSponsorship is not true)
await sendTransaction({ to: "0x...", data: "0x..." });

// Disable sponsorship for this specific transaction
await sendTransaction(
  { to: "0x...", data: "0x..." },
  { disableSponsorship: true },
);
```

## API Reference

### Hooks

#### `useAlchemySendTransaction()`

Send single or batch EVM transactions with optional gas sponsorship.

**Returns:**

- `sendTransaction(input, options?)` - Send a single transaction or batch of transactions
  - `input` - Single `UnsignedTransactionRequest` or array of them
  - `options` - Optional `SendTransactionOptions`
- `isLoading` - Loading state
- `error` - Error object if failed
- `data` - Transaction result with `txnHash`
- `reset()` - Reset hook state

#### `useAlchemyPrepareSwap()`

Request swap quotes and prepare swap calls.

**Returns:**

- `prepareSwap(request)` - Get quote and prepare swap (returns full response with `quote` and call data)
- `isLoading` - Loading state
- `error` - Error object if failed
- `data` - Prepared swap result
- `reset()` - Reset hook state

#### `useAlchemySubmitSwap()`

Sign and submit prepared swap calls.

**Returns:**

- `submitSwap(preparedSwap)` - Execute prepared swap (accepts result from `prepareSwap`)
- `isLoading` - Loading state
- `error` - Error object if failed
- `data` - Swap result with `txnHash`
- `reset()` - Reset hook state

#### `useAlchemySolanaTransaction(options?)`

Send Solana transactions with optional gas sponsorship via Alchemy.

**Parameters:**

- `options.rpcUrl` - Solana RPC URL (overrides provider config)
- `options.policyId` - Gas sponsorship policy ID (overrides provider config)
- `options.walletAddress` - Specific wallet address to use (defaults to first wallet)
- `options.confirmationOptions` - Transaction confirmation options

**Returns:**

- `sendTransactionAsync(params)` - Send transaction and await result (throws on error)
  - `params.transfer` - Simple SOL transfer with `amount` (lamports) and `toAddress`
  - `params.instructions` - Custom Solana transaction instructions array
- `sendTransaction(params)` - Send transaction (fire-and-forget, errors caught internally)
- `connection` - Active Solana connection instance
- `isPending` - Whether a transaction is currently being sent
- `error` - Error object if failed
- `data` - Transaction result with `hash` (base58 signature)
- `reset()` - Reset hook state

#### `useAlchemyClient()`

Get the underlying smart wallet client and account (advanced use cases).

**Returns:**

- `getClient()` - Async function that returns `{ client: SmartWalletClient, account: SmartContractAccount }`
  - `client` - The smart wallet client instance
  - `account` - The smart account with address and other account info

## How It Works

### EIP-7702 Delegation (Default)

This package uses [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) to upgrade your users' Privy wallets into smart accounts **without requiring them to deploy new contracts or migrate funds**.

When a user sends their first transaction:

1. Their wallet signs an EIP-7702 authorization
2. The authorization delegates to Alchemy's smart account implementation
3. The transaction is executed with smart account features (batching, sponsorship, etc.)
4. Gas is optionally sponsored by your Gas Manager policy

### Smart Wallet Client

Under the hood, this package:

1. Connects to your user's Privy embedded wallet
2. Wraps it with `WalletClientSigner` from `@aa-sdk/core`
3. Creates a `SmartWalletClient` with EIP-7702 support (default) or traditional smart account support
4. Routes transactions through Alchemy infrastructure
5. Automatically handles sponsorship via Gas Manager policies

### Authorization Modes

The package supports two authorization modes via the `accountAuthMode` prop:

- **`'eip7702'` (default, recommended)**: Uses EIP-7702 to delegate the Privy wallet to a smart account. No separate deployment needed, funds stay at the wallet address. This is the recommended mode for most applications.
- **`'owner'`**: Uses a traditional smart account with the Privy wallet as the owner/signer. The smart account has a separate address from the owner wallet. Use this if you need compatibility with environments that don't support EIP-7702 yet.

```tsx
// Default behavior (EIP-7702)
<AlchemyProvider apiKey="...">
  <YourApp />
</AlchemyProvider>

// Traditional smart account mode
<AlchemyProvider apiKey="..." accountAuthMode="owner">
  <YourApp />
</AlchemyProvider>
```

**Getting the Smart Account Address:**

When using `owner` mode, the smart account has a different address from your Privy signer. Access it via `useAlchemyClient`:

```tsx
import { useAlchemyClient } from "@account-kit/privy-integration";

function MyComponent() {
  const { getClient } = useAlchemyClient();

  const getSmartAccountAddress = async () => {
    const { account } = await getClient();
    console.log("Smart account address:", account.address);
    // This is different from the Privy signer address in owner mode
  };
}
```

## Get Your API Keys

### Alchemy API Key

1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. Create or select an app
3. Copy your API key

### Gas Manager Policy ID (Optional)

1. Go to [Gas Manager](https://dashboard.alchemy.com/gas-manager)
2. Create a new policy with your desired rules
3. Copy the policy ID

### Privy App ID

1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Create or select an app
3. Copy your app ID

## Migration from Privy Transactions

If you're currently using Privy's `useSendTransaction` hook:

### Before

```tsx
import { useSendTransaction } from "@privy-io/react-auth";

const { sendTransaction } = useSendTransaction({
  onSuccess: (txHash) => console.log(txHash),
});
```

### After

```tsx
import { useAlchemySendTransaction } from "@account-kit/privy-integration";

const { sendTransaction, data } = useAlchemySendTransaction();

// Now with gas sponsorship!
```

The API is nearly identical, making migration seamless.

## Advanced Usage

### Access the Smart Wallet Client

For advanced use cases, access the underlying client and account directly:

```tsx
import { useAlchemyClient } from "@account-kit/privy-integration";

function AdvancedComponent() {
  const { getClient } = useAlchemyClient();

  const doAdvancedOperation = async () => {
    const { client, account } = await getClient();

    // Access the smart account address
    console.log("Smart account address:", account.address);

    // Direct access to sendCalls with full control
    await client.sendCalls({
      from: account.address,
      calls: [
        { to: "0x...", data: "0x..." },
        { to: "0x...", data: "0x..." },
      ],
      capabilities: {
        eip7702Auth: true, // Set to true for EIP-7702 mode
        paymasterService: { policyId: "your-policy-id" },
      },
    });

    // Note: For most cases, use useAlchemySendTransaction instead
  };

  return <button onClick={doAdvancedOperation}>Advanced Op</button>;
}
```

## Troubleshooting

### TypeScript error: "Type ... is not assignable to type 'AlchemyProviderConfig'"

The provider requires exactly one valid transport configuration. Valid combinations:

- `apiKey` only
- `jwt` only
- `rpcUrl` only
- `rpcUrl` + `jwt` together

Invalid combinations like `apiKey` + `jwt` will now show TypeScript errors.

### Swaps failing with "Received raw calls"

The swap API should return prepared calls by default. This error means the API returned raw calls. Ensure you're not setting `returnRawCalls: true` in the request.

## Examples

Check out the [`examples/`](../../examples/) directory for complete applications:

- **Privy Integration Demo** - Demos sponsored transactions and sponsored swaps

## Resources

- [Alchemy Smart Wallet Documentation](https://www.alchemy.com/docs/wallets/)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
- [Gas Manager Dashboard](https://dashboard.alchemy.com/services/gas-manager/overview)

## Support

- [Discord](https://discord.gg/alchemy)
- [GitHub Issues](https://github.com/alchemyplatform/aa-sdk/issues)
- [Alchemy Support](https://www.alchemy.com/support)

## License

MIT
