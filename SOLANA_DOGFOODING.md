# Solana Smart Wallet — Dogfooding Guide

Five ways to test Solana smart wallets: a CLI e2e script using the SDK client, a CLI e2e script using raw JSON-RPC, a Next.js app with Privy login, and two browser-wallet demos (wallet adapter + raw Phantom).

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

## 4. Wallet Standard Example (`/wallet-standard`)

Uses `@wallet-standard/app` to discover any installed Solana wallet (Phantom, Solflare, Backpack, etc.) directly — no Privy, no wallet adapter library. This demonstrates that `SolanaStandardSigner` is a real standard, not a Privy-specific thing.

### Run it

Same as the Privy example — `pnpm dev` from `examples/solana-privy/`, then open [http://localhost:3000/wallet-standard](http://localhost:3000/wallet-standard).

### Walkthrough

1. The page lists all detected browser wallets. Click **Connect \<wallet-name\>**
2. Approve the connection in the wallet popup
3. Click **Send Sponsored SOL Transfer**
4. Approve the transaction signing in the wallet popup
5. Watch the status area for confirmation

### How the code works

`getWallets()` from `@wallet-standard/app` discovers wallets that register via the wallet-standard protocol. The wallet's `solana:signTransaction` feature already speaks `Uint8Array` in and out — matching `SolanaStandardSigner` with no serialization adapter:

```ts
import { getWallets } from "@wallet-standard/app";

const { get, on } = getWallets();
const solanaWallets = get().filter((w) =>
  "standard:connect" in w.features && "solana:signTransaction" in w.features
);

// connect
const { accounts } = await wallet.features["standard:connect"].connect();
const account = accounts[0];

// build signer — Uint8Array in, Uint8Array out, no VersionedTransaction dance
const signer = {
  address: account.address,
  signTransaction: async ({ transaction }: { transaction: Uint8Array }) => {
    const [output] = await wallet.features["solana:signTransaction"]
      .signTransaction({ account, transaction });
    return output; // { signedTransaction: Uint8Array }
  },
};

const client = createSmartWalletClient({
  signer,
  transport: alchemyWalletTransport({ apiKey, url }),
  chain: "solana:devnet",
  paymaster: { policyId: SOLANA_POLICY_ID },
});
```

No `VersionedTransaction`, no `@solana/web3.js` — just wallet-standard primitives.

---

## 5. Raw Phantom Example (`/phantom-raw`)

Connects directly to `window.phantom.solana` without any wallet adapter library. This is the most minimal integration — useful for understanding what the adapter layer does under the hood.

### Prerequisites

[Phantom](https://phantom.app/) must be installed as a browser extension.

### Run it

Same as the Privy example — `pnpm dev` from `examples/solana-privy/`, then open [http://localhost:3000/phantom-raw](http://localhost:3000/phantom-raw).

### Walkthrough

1. Click **Connect Phantom** — approve the connection in the Phantom popup
2. Click **Send Sponsored SOL Transfer**
3. Approve the transaction signing in the Phantom popup
4. Watch the status area for confirmation

### How the code works

Phantom's injected provider (`window.phantom.solana`) exposes `connect()` and `signTransaction()`. The adapter is identical to the wallet adapter version — deserialize, sign, re-serialize:

```ts
import { VersionedTransaction } from "@solana/web3.js";

const phantom = window.phantom?.solana;
const { publicKey } = await phantom.connect();

const signer = {
  address: publicKey.toBase58(),
  signTransaction: async ({ transaction }: { transaction: Uint8Array }) => {
    const tx = VersionedTransaction.deserialize(transaction);
    const signed = await phantom.signTransaction(tx);
    return { signedTransaction: new Uint8Array(signed.serialize()) };
  },
};

const client = createSmartWalletClient({ signer, transport, chain, paymaster });
```

No additional dependencies are needed beyond what the Privy example already has.

---

## Signer compatibility

The SDK accepts three kinds of Solana signers:

| Signer type | What it is | How it signs | Example |
|-------------|-----------|-------------|---------|
| **`SolanaTransactionPartialSigner`** | `@solana/kit` `KeyPairSigner` or anything with `signTransactions` | Deserializes the full transaction, signs, returns signature dict | SDK e2e, raw RPC e2e |
| **`SolanaMessageSigner`** | Any object with `{ address, signMessage }` | Signs raw message bytes extracted from the transaction | SDK e2e |
| **Wallet-standard (direct)** | Privy, Phantom, etc. via `@wallet-standard/base` | Uses `signTransaction` feature from the standard (`Uint8Array` in/out) | Privy example, wallet standard example |
| **Legacy provider (adapted)** | `window.phantom.solana` or other injected providers | Deserialize `Uint8Array` → `VersionedTransaction`, sign, re-serialize | Raw Phantom example |

All of these produce an Ed25519 signature that gets submitted via `wallet_sendPreparedCalls`.

---

## Signer interface discussion (needs alignment)

### The problem

`SolanaStandardSigner` is a simple interface:

```ts
interface SolanaStandardSigner {
  address: string;
  signTransaction(input: { transaction: Uint8Array }): Promise<{ signedTransaction: Uint8Array }>;
}
```

**Privy works directly** — `useConnectedStandardWallets()` returns objects that match this shape out of the box. No adapter needed. But Privy is doing the adaptation internally — their hook wraps the raw wallet-standard wallet (which requires an `account` param and returns arrays) into this simpler shape.

**Everything else needs an adapter today:**

| Integration | What it exposes | Mismatch |
|---|---|---|
| `@solana/wallet-adapter-react` (`useWallet()`) | `signTransaction(VersionedTransaction)` | Uses web3.js v1 objects, not `Uint8Array` — need to deserialize/re-serialize |
| `@wallet-standard/app` (raw wallet-standard) | `signTransaction({ account, transaction: Uint8Array })` → `[{ signedTransaction }]` | Requires `account` param, returns array — need to inject account and unwrap |
| `window.phantom.solana` (legacy provider) | `signTransaction(VersionedTransaction)` | Same as wallet-adapter — web3.js v1 objects |

### Why this matters

`@solana/wallet-adapter-react` is what ~90% of React Solana devs use for wallet connection. There is no updated version that exposes `Uint8Array` natively — the React hooks still use the legacy `VersionedTransaction` API even though the library uses wallet-standard internally for discovery. This is a gap in the Solana ecosystem, not something we can fix.

Without SDK-provided adapters, every developer using `wallet-adapter-react` has to write this inline:

```ts
const signer = {
  address: publicKey.toBase58(),
  signTransaction: async ({ transaction }: { transaction: Uint8Array }) => {
    const tx = VersionedTransaction.deserialize(transaction);
    const signed = await signTransaction(tx);
    return { signedTransaction: new Uint8Array(signed.serialize()) };
  },
};
```

It's only ~5 lines, but it's confusing — devs will ask "why do I need this if the interface is supposed to be standard?"

### Proposed solution: SDK adapter helpers

Add `fromWalletAdapter` (and optionally `fromWalletStandard`) alongside the existing `fromKitSigner` and `fromKeypair` adapters:

```ts
// @alchemy/wallet-apis/solana-adapters

// Priority — covers the most common React integration path
import { fromWalletAdapter } from "@alchemy/wallet-apis/solana-adapters";
const { publicKey, signTransaction } = useWallet();
const signer = fromWalletAdapter({ publicKey, signTransaction });

// Optional — for devs using @wallet-standard/app directly
import { fromWalletStandard } from "@alchemy/wallet-apis/solana-adapters";
const signer = fromWalletStandard({ wallet, account });
```

This keeps `SolanaStandardSigner` simple, doesn't force Privy users to change anything, and makes every other integration path a one-liner.

### Open questions

1. **Do Dynamic / Capsule / other wallet providers expose the same interface as Privy?** If their hooks return `{ address, signTransaction({ transaction: Uint8Array }) }` directly, they'd work without adapters too. Needs verification.
2. **Should `createSmartWalletClient` accept a wallet-standard wallet + account directly?** Instead of only accepting `SolanaStandardSigner`, it could also accept `{ wallet: Wallet, account: WalletAccount }` and handle the unwrapping internally. More flexible but more complex types.
3. **Is `fromWalletAdapter` enough, or do we also need `fromWalletStandard`?** `fromWalletAdapter` covers the vast majority of use cases. `fromWalletStandard` is trivial to implement but the audience is mostly library authors.

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
