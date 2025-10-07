# @account-kit/privy-integration

Add gas sponsorship and smart wallet features to your Privy app in under 5 minutes.

## What This Package Does

If you're already using [Privy](https://privy.io) for authentication, this package lets you upgrade your users' wallets with:

- **🔄 EIP-7702 Delegation** - Upgrade EOAs to smart accounts without migration
- **⛽ Gas Sponsorship** - Pay gas fees for your users via Alchemy Gas Manager
- **💱 Token Swaps** - Execute swaps through Alchemy's swap infrastructure
- **🚀 Batched Transactions** - Send multiple operations in a single transaction

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

## Quick Start

### 1. Wrap Your App with Both Providers

```tsx
import { PrivyProvider } from "@privy-io/react-auth";
import { AlchemyProvider } from "@account-kit/privy-integration";

function App() {
  return (
    <AlchemyProvider
      apiKey="your-alchemy-api-key"
      policyId="your-gas-policy-id" // optional, for gas sponsorship
    >
      <PrivyProvider
        appId="your-privy-app-id"
        config={
          {
            /* your privy config */
          }
        }
      >
        <YourApp />
      </PrivyProvider>
    </AlchemyProvider>
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

  return (
    <button onClick={handleSend} disabled={isLoading}>
      {isLoading ? "Sending..." : "Send Transaction"}
    </button>
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

## Configuration

### AlchemyProvider Props

| Prop                 | Type                 | Required      | Description                                                                                          |
| -------------------- | -------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `apiKey`             | `string`             | Conditional\* | Your Alchemy API key for @account-kit/infra transport                                                |
| `jwt`                | `string`             | Conditional\* | JWT token for authentication (alternative to `apiKey`)                                               |
| `rpcUrl`             | `string`             | Conditional\* | Custom RPC URL (can be used alone or with `jwt`)                                                     |
| `policyId`           | `string \| string[]` | No            | Gas Manager policy ID(s) for sponsorship. If array is provided, backend uses first applicable policy |
| `disableSponsorship` | `boolean`            | No            | Set to `true` to disable gas sponsorship by default (default: `false`)                               |

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

Send transactions with optional gas sponsorship.

**Returns:**

- `sendTransaction(input, options?)` - Send a transaction
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

#### `useAlchemyClient()`

Get the underlying smart wallet client (advanced use cases).

**Returns:**

- `getClient()` - Async function that returns `SmartWalletClient`

## How It Works

### EIP-7702 Delegation

This package uses [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) to upgrade your users' Privy wallets into smart accounts **without requiring them to deploy new contracts or migrate funds**.

When a user sends their first transaction:

1. Their EOA signs an EIP-7702 authorization
2. The authorization delegates to Alchemy's smart account implementation
3. The transaction is executed with smart account features (batching, sponsorship, etc.)
4. Gas is optionally sponsored by your Gas Manager policy

### Smart Wallet Client

Under the hood, this package:

1. Connects to your user's Privy embedded wallet
2. Wraps it with `WalletClientSigner` from `@aa-sdk/core`
3. Creates a `SmartWalletClient` with EIP-7702 support
4. Routes transactions through Alchemy infrastructure
5. Automatically handles sponsorship via Gas Manager policies

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

For advanced use cases, access the underlying client:

```tsx
import { useAlchemyClient } from "@account-kit/privy-integration";

function AdvancedComponent() {
  const { getClient } = useAlchemyClient();

  const doAdvancedOperation = async () => {
    const client = await getClient();

    // Use any SmartWalletClient method
    const address = await client.getAddress();

    // Batch multiple calls
    await client.sendCalls({
      from: address,
      calls: [
        { to: "0x...", data: "0x..." },
        { to: "0x...", data: "0x..." },
      ],
      capabilities: {
        eip7702Auth: true,
        paymasterService: { policyId: "your-policy-id" },
      },
    });
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

### Cache issues after logout

The client cache automatically clears on logout and wallet changes. If you need manual control:

```tsx
import { resetClientCache } from "@account-kit/privy-integration";

// Manually reset (rarely needed)
resetClientCache();
```

## Examples

Check out the [`examples/`](../../examples/) directory for complete applications:

- **Privy Integration Demo** - Advanced patterns and use cases

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
