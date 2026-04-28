# Solana Smart Wallet — Dogfooding Guide

Three ways to test Solana smart wallets: a CLI e2e script using the SDK client, a CLI e2e script using raw JSON-RPC, and a Next.js app with Privy login.

All three use the **Alchemy Wallet APIs preview endpoint** and run on **Solana devnet**.

---

## Prerequisites

| What | Where to get it |
|------|----------------|
| **Alchemy API key** | Dashboard — must have Wallet APIs enabled |
| **Solana policy ID** | Gas Manager → create a Solana devnet sponsorship policy |
| **Privy app ID** (Privy example only) | [Privy dashboard](https://dashboard.privy.io) — enable Solana embedded wallets |
| **bun** (CLI scripts) | `brew install oven-sh/bun/bun` |
| **Node 18+** (Privy example) | Already on your machine |

---

## 1. SDK Client E2E (`solana-e2e.ts`)

Uses `createSmartWalletClient` from `@alchemy/wallet-apis`. This is the highest-level API — it handles prepare, sign, and send internally.

### What it tests

- **TransactionPartialSigner** path — uses an `@solana/kit` `KeyPairSigner` (signs full serialized transactions)
- **MessageSigner** path — uses a raw Web Crypto Ed25519 key pair (signs only the transaction message bytes)

### Run it

```bash
ALCHEMY_API_KEY=<your-key> SOLANA_POLICY_ID=<your-policy> \
  bun packages/wallet-apis/src/__tests__/solana-e2e.ts
```

### What to expect

The script creates two ephemeral key pairs, sends a sponsored 0-lamport self-transfer for each, and waits for on-chain confirmation. You should see output like:

```
Chain: solana:devnet
Policy: <your-policy-id>

=== TransactionPartialSigner (@solana/kit) ===
Signer: <base58-address>
Sending calls...
Call ID: <uuid>
Waiting for status...
Status: confirmed (200)
Signature: <base58-tx-signature>
TransactionPartialSigner (@solana/kit) passed!

=== MessageSigner (raw Ed25519) ===
Signer: <base58-address>
Sending calls...
Call ID: <uuid>
Waiting for status...
Status: confirmed (200)
Signature: <base58-tx-signature>
MessageSigner (raw Ed25519) passed!

All tests passed!
```

---

## 2. Raw JSON-RPC E2E (`solana-raw-rpc-e2e.ts`)

Calls `wallet_prepareCalls`, `wallet_sendPreparedCalls`, and `wallet_getCallsStatus` directly via `fetch`. No SDK client — useful for understanding the wire protocol or building in a language without an SDK.

### What it tests

- **Raw Ed25519 signing** — extracts message bytes from the serialized transaction and signs with Web Crypto
- **@solana/kit signing** — deserializes the transaction, signs with `KeyPairSigner.signTransactions`

### Run it

```bash
ALCHEMY_API_KEY=<your-key> SOLANA_POLICY_ID=<your-policy> \
  bun packages/wallet-apis/src/__tests__/solana-raw-rpc-e2e.ts
```

This script logs **full JSON-RPC request and response bodies** for every call. Use it to see exact payloads.

### JSON-RPC methods used

#### `wallet_prepareCalls`

Prepares a set of Solana instructions for signing. Returns a serialized transaction with fee payer and recent blockhash filled in.

**Request:**

```jsonc
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "wallet_prepareCalls",
  "params": [
    {
      "calls": [
        {
          "programId": "11111111111111111111111111111111",
          "accounts": [
            { "pubkey": "<signer-address>", "isSigner": true, "isWritable": true },
            { "pubkey": "<recipient-address>", "isSigner": false, "isWritable": true }
          ],
          "data": "0x0200000000000000000000000000"  // system program transfer instruction data
        }
      ],
      "chainId": "solana:devnet",
      "from": "<signer-address>",
      "capabilities": {
        "paymasterService": {
          "policyId": "<your-policy-id>"
        }
      }
    }
  ]
}
```

**Response:**

```jsonc
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "type": "solana-transaction",
    "chainId": "solana:devnet",
    "signatureRequest": {
      "type": "solana-transaction",
      "data": "0x..."  // hex-encoded serialized Solana transaction (signable)
    },
    "data": {
      // opaque server-side context — pass back to wallet_sendPreparedCalls unchanged
    },
    "feePayment": {
      "sponsored": true,
      "token": null
    }
  }
}
```

#### `wallet_sendPreparedCalls`

Submits the prepared transaction along with the signer's Ed25519 signature.

**Request:**

```jsonc
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "wallet_sendPreparedCalls",
  "params": [
    {
      "type": "solana-transaction",
      "chainId": "solana:devnet",
      "data": { /* opaque data from prepareCalls result */ },
      "signature": {
        "type": "ed25519",
        "data": "<base58-encoded-ed25519-signature>"
      }
    }
  ]
}
```

**Response:**

```jsonc
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "id": "<call-bundle-id>"  // UUID — use this to poll status
  }
}
```

#### `wallet_getCallsStatus`

Polls for the status of a submitted call bundle.

**Request:**

```jsonc
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "wallet_getCallsStatus",
  "params": ["<call-bundle-id>"]
}
```

**Response (pending):**

```jsonc
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "status": 100,           // < 200 = pending
    "receipts": null
  }
}
```

**Response (confirmed):**

```jsonc
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "status": 200,           // 200 = success, 300+ = failure
    "receipts": [
      {
        "signature": "<base58-solana-tx-signature>",
        "slot": 123456789
      }
    ]
  }
}
```

---

## 3. Privy + Next.js Example (`examples/solana-privy/`)

A minimal Next.js app that logs in with Privy, creates a Solana embedded wallet, and sends a sponsored transaction through the Alchemy smart wallet.

### Setup

```bash
cd examples/solana-privy

# Install dependencies
pnpm install

# Create .env.local with your keys
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
NEXT_PUBLIC_ALCHEMY_API_KEY=<your-alchemy-api-key>
NEXT_PUBLIC_SOLANA_POLICY_ID=<your-solana-policy-id>
```

#### Privy dashboard config

1. Go to [dashboard.privy.io](https://dashboard.privy.io) and select your app
2. Under **Embedded wallets**, make sure Solana wallets are enabled and set to create on login
3. Under **Login methods**, enable at least email or Google

### Run it

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Walkthrough

1. Click **Login with Privy** — sign in with email or Google
2. If no Solana wallet exists, click **Create Solana Wallet**
3. Click **Send Sponsored SOL Transfer** — this sends a 0-lamport self-transfer through the Alchemy smart wallet
4. Watch the status area — you should see the call ID, then confirmation with a Solana transaction signature

### How the code works

The Privy wallet (`useConnectedStandardWallets`) returns a wallet-standard `StandardConnect` signer. The SDK's `createSmartWalletClient` accepts this directly:

```ts
import { createSmartWalletClient, alchemyWalletTransport } from "@alchemy/wallet-apis";

const client = createSmartWalletClient({
  signer: privyWallet,              // wallet-standard signer from Privy
  transport: alchemyWalletTransport({
    apiKey: ALCHEMY_API_KEY,
    url: "https://api.g.alchemypreview.com/v2",
  }),
  chain: "solana:devnet",
  paymaster: { policyId: SOLANA_POLICY_ID },
});

const { id } = await client.sendCalls({
  calls: [
    {
      programId: "11111111111111111111111111111111",
      accounts: [
        { pubkey: wallet.address, isSigner: true, isWritable: true },
        { pubkey: wallet.address, isSigner: false, isWritable: true },
      ],
      data: "0x0200000000000000000000000000",
    },
  ],
});

const result = await client.waitForCallsStatus({ id });
```

---

## Signer compatibility

The SDK accepts three kinds of Solana signers:

| Signer type | What it is | How it signs |
|-------------|-----------|-------------|
| **`SolanaTransactionPartialSigner`** | `@solana/kit` `KeyPairSigner` or anything with `signTransactions` | Deserializes the full transaction, signs, returns signature dict |
| **`SolanaMessageSigner`** | Any object with `{ address, signMessage }` | Signs raw message bytes extracted from the transaction |
| **Wallet-standard** | Privy, Phantom, etc. via `@wallet-standard/base` | Uses `signTransaction` feature from the standard |

All three produce an Ed25519 signature that gets submitted via `wallet_sendPreparedCalls`.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Missing ALCHEMY_API_KEY` | Set the env var before running |
| `RPC error: unauthorized` | API key doesn't have Wallet APIs enabled |
| `RPC error: policy not found` | Policy ID is wrong or not a Solana devnet policy |
| Privy login fails | Check `NEXT_PUBLIC_PRIVY_APP_ID` matches your Privy dashboard app |
| `No Solana embedded wallet found` | Click "Create Solana Wallet" or enable auto-create in Privy dashboard |
| Transaction stays pending | Devnet can be slow — the script polls for up to 60s |
