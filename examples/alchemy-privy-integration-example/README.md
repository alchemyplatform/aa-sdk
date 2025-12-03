# Alchemy Privy Integration Example

This example demonstrates how to integrate Alchemy's gas sponsorship and smart wallet features with Privy authentication using the `@account-kit/privy-integration` package.

## Features

- ✨ **Privy Authentication** - Email, social, and passkey login
- ⛽ **Gas Sponsorship** - Gasless transactions via Alchemy Gas Manager
- 🔄 **EIP-7702 Delegation** - Upgrade EOAs to smart accounts without migration
- 💱 **Token Swaps** - Swap tokens with sponsored gas
- 📦 **Simple Integration** - Drop-in React hooks from `@account-kit/privy-integration`

## What This Example Shows

This example demonstrates three key integrations:

### 1. Send Transaction Component

Shows how to use `useAlchemySendTransaction()` to send ETH with gas sponsorship:

```tsx
const { sendTransaction, isLoading } = useAlchemySendTransaction();

await sendTransaction({
  to: recipientAddress,
  value: parseEther(amount),
  data: "0x",
});
```

### 2. Token Swap Component

Shows the two-step swap flow using `useAlchemyPrepareSwap()` and `useAlchemySubmitSwap()`:

```tsx
// Step 1: Get quote
const { prepareSwap } = useAlchemyPrepareSwap();
const preparedSwap = await prepareSwap({ fromToken, toToken, minimumToAmount });

// Step 2: Execute swap
const { submitSwap } = useAlchemySubmitSwap();
await submitSwap(preparedSwap);
```

### 3. Account Info Component

Shows how to fetch and display user wallet information using Privy hooks and viem.

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in your credentials:

```
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your-privy-client-id
NEXT_PUBLIC_ALCHEMY_API_KEY=your-alchemy-api-key
NEXT_PUBLIC_ALCHEMY_POLICY_ID=your-gas-policy-id
```

#### Getting Your Keys

- **Privy App ID**: Get it from [Privy Dashboard](https://dashboard.privy.io/)
- **Alchemy API Key**: Get it from [Alchemy Dashboard](https://dashboard.alchemy.com/)
- **Gas Policy ID**: Create a policy in [Gas Manager](https://dashboard.alchemy.com/gas-manager)

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Main app page with authentication flow
│   ├── providers.tsx    # Privy + Alchemy provider setup
│   └── styles.css       # Simple global styles
└── components/
    ├── AccountInfo.tsx      # Display wallet info and balance
    ├── SendTransaction.tsx  # Send ETH with gas sponsorship
    └── TokenSwap.tsx        # Two-step token swap flow
```

### Key Files to Study

- **`src/app/providers.tsx`** - Shows how to wrap your app with `AlchemyProvider` and `PrivyProvider`
- **`src/components/SendTransaction.tsx`** - Complete example of `useAlchemySendTransaction()`
- **`src/components/TokenSwap.tsx`** - Complete example of swap prepare + submit flow
