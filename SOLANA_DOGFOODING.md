# Solana Smart Wallet — Dogfooding Guide

API shape, real request/response examples, and five runnable demos for Solana smart wallets.

All examples use the **Alchemy Wallet APIs preview endpoint** on **Solana devnet**.

---

## Prerequisites

| What                                  | Where to get it                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| **Alchemy API key**                   | Dashboard — must have Wallet APIs enabled                                      |
| **Solana policy ID**                  | Gas Manager → create a Solana devnet sponsorship policy                        |
| **Privy app ID** (Privy example only) | [Privy dashboard](https://dashboard.privy.io) — enable Solana embedded wallets |
| **bun** (CLI scripts)                 | `brew install oven-sh/bun/bun`                                                 |
| **Node 18+** (Privy example)          | Already on your machine                                                        |

---

## API Shape

### Common Types

#### SolanaChainId

```
"solana:mainnet" | "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"   // Mainnet
"solana:devnet"  | "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"   // Devnet
```

#### SolanaAddress

Base58-encoded string, 32-44 characters.

#### SolanaInstruction

```jsonc
{
  "programId": SolanaAddress,             // required
  "accounts": [                           // optional
    {
      "pubkey": SolanaAddress,
      "isSigner": boolean,
      "isWritable": boolean
    }
  ],
  "data": Hex                             // hex-encoded instruction data
}
```

#### StatusCode

| Code | Title | Description |
|------|-------|-------------|
| 100 | Pending | Submitted but not yet confirmed |
| 200 | Confirmed | Included on-chain successfully |
| 400 | Offchain Failure | Not included on-chain, will not retry (e.g. expired blockhash) |
| 500 | Onchain Failure | Reverted completely on-chain |

> Codes 110, 115, 116, 120, 410, 600 exist in the union but are EVM/cross-chain specific.

---

### wallet_prepareCalls

#### Request

```jsonc
{
  "method": "wallet_prepareCalls",
  "params": [
    {
      "calls": SolanaInstruction[],                     // required
      "from": SolanaAddress,                            // required - user's signing address
      "chainId": SolanaChainId,                         // required

      // optional
      "addressLookupTableAddresses": SolanaAddress[],
      "capabilities": {
        "paymasterService": {                           // optional - omit for unsponsored
          "policyId": string,                           // UUID, required if present
          "webhookData": string                         // optional
        }
      }
    }
  ]
}
```

#### Response

```jsonc
{
  "type": "solana-transaction-v0",
  "chainId": SolanaChainId,

  "signatureRequest": {
    "type": "solana_signTransaction",
    "data": Hex                                         // full serialized tx to sign
  },

  "data": {
    "compiledTransaction": Hex,                         // pre-compiled wire-format bytes
    "signer": SolanaAddress,                            // user's signing address
    "version": "0",
    "lifetimeConstraint": {
      "blockHash": string,                              // base58-encoded
      "lastValidBlockHeight": Hex                       // optional, hex-encoded bigint
    }
  },

  "feePayment": {
    "sponsored": boolean,
    "feePayer": SolanaAddress
  },

  "details": {
    "type": "solana-transaction-v0",
    "data": {
      "calls": SolanaInstruction[],                     // echo of original instructions
      "addressLookupTableAddresses": SolanaAddress[]    // optional
    }
  }
}
```

---

### wallet_sendPreparedCalls

#### Request

```jsonc
{
  "method": "wallet_sendPreparedCalls",
  "params": [
    {
      "type": "solana-transaction-v0",
      "chainId": SolanaChainId,

      "data": {
        "compiledTransaction": Hex,                     // from prepareCalls response
        "signer": SolanaAddress,
        "version": "0",
        "lifetimeConstraint": {
          "blockHash": string,                          // base58-encoded
          "lastValidBlockHeight": Hex                   // optional
        }
      },

      "signature": {
        "type": "ed25519",
        "data": string                                  // 64-byte Ed25519 signature, base58-encoded
      }
    }
  ]
}
```

#### Response

```jsonc
{
  "id": Hex,                                            // call ID for polling status
  "preparedCallIds": Hex[],                             // deprecated, use id
  "details": {
    "type": "solana-transaction-v0"
  }
}
```

---

### wallet_getCallsStatus

#### Request

```jsonc
{
  "method": "wallet_getCallsStatus",
  "params": [
    Hex                                                 // call ID from sendPreparedCalls
  ]
}
```

#### Response

```jsonc
{
  "id": Hex,
  "chainId": SolanaChainId,
  "atomic": boolean,                                    // always true for Solana
  "status": StatusCode,                                 // 100 | 200 | 400 | 500

  // optional - present once status resolves
  "commitment": "processed" | "confirmed" | "finalized",
  "receipts": [
    {
      "signature": string,                              // base58-encoded tx signature
      "blockTime": Hex,                                 // optional, unix timestamp
      "slot": Hex                                       // slot number
    }
  ]
}
```

---

### Flow

```
1. wallet_prepareCalls       → get signatureRequest.data
2. Client signs with Ed25519
3. wallet_sendPreparedCalls  → get id
4. wallet_getCallsStatus(id) → poll until status != 100
```

---

### Full Examples (Real Devnet Responses)

#### wallet_sendPreparedCalls — request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "wallet_sendPreparedCalls",
  "params": [
    {
      "type": "solana-transaction-v0",
      "chainId": "solana:devnet",
      "data": {
        "compiledTransaction": "0x029f72cdb1dccd1e56e73241b2a2f87fe994dc7bbe67e992b66b55d0e9a673eb2ee5842f6182c6dc4cce9b0892a903bd4416b09d6f71425831986d287d7deaaf0500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800200010314f223f56f8a396dc5ca02028ede46d3c78161db1856f9dc5f63791527f89ed0d4e5f248a0a5d2cb435cefd313c83468487fce7d2a09edc913f04e9bf15bbb040000000000000000000000000000000000000000000000000000000000000000f7536d1d18a5cc6a94ae7efffcde49598d4e91c0a261d7ee9b516c018b33297101020201010e020000000000000000000000000000",
        "signer": "FL4oGUvc8DKrKFpxRCVcWQuC3WGLWDvTQzyqqJxUs7vB",
        "version": "0",
        "lifetimeConstraint": {
          "blockHash": "HeTV4vHkpF4G7anshbvkz2DtUxJtEESZ1AsQuKSFQQxg",
          "lastValidBlockHeight": "0x1aa1d340"
        }
      },
      "signature": {
        "type": "ed25519",
        "data": "2YYhoCTmPPbbv9sGKPkWYYbth6a46f1atvKHLcE41Tn8WWRNjva1krnWTJNq8iY1dzcAdkHMStSJnzomKrbv6DpM"
      }
    }
  ]
}
```

#### wallet_sendPreparedCalls — response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "id": "0x010300000000000000000000000000000000000000000000000000000000000000679f72cdb1dccd1e56e73241b2a2f87fe994dc7bbe67e992b66b55d0e9a673eb2ee5842f6182c6dc4cce9b0892a903bd4416b09d6f71425831986d287d7deaaf05f7536d1d18a5cc6a94ae7efffcde49598d4e91c0a261d7ee9b516c018b332971",
    "preparedCallIds": [
      "0x010300000000000000000000000000000000000000000000000000000000000000679f72cdb1dccd1e56e73241b2a2f87fe994dc7bbe67e992b66b55d0e9a673eb2ee5842f6182c6dc4cce9b0892a903bd4416b09d6f71425831986d287d7deaaf05f7536d1d18a5cc6a94ae7efffcde49598d4e91c0a261d7ee9b516c018b332971"
    ],
    "details": {
      "type": "solana-transaction-v0"
    }
  }
}
```

#### wallet_getCallsStatus — pending

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "id": "0x010300...332971",
    "chainId": "solana:devnet",
    "atomic": true,
    "status": 100
  }
}
```

#### wallet_getCallsStatus — confirmed

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "id": "0x010300...332971",
    "chainId": "solana:devnet",
    "atomic": true,
    "status": 200,
    "commitment": "confirmed",
    "receipts": [
      {
        "signature": "4Bu3fdFWRMerLXeumu7yWWFJnTvGyuViDt9Y3tkGUCtEp7XSnKstVxCqqrAQwji87HhvC6WhBksdjLXq19CNsZLx",
        "blockTime": "0x69f24c8e",
        "slot": "0x1b5af7e1"
      }
    ]
  }
}
```

---

## Signer Interface: `SolanaSigner`

The SDK's signer contract — the simplest possible interface:

```ts
interface SolanaSigner {
  address: string;
  signTransaction(input: {
    transaction: Uint8Array;
  }): Promise<{ signedTransaction: Uint8Array }>;
}
```

Adapters in `@alchemy/wallet-apis/solana` convert various signer sources into this interface:

| What you have | Adapter | Source |
|---|---|---|
| Privy `useConnectedStandardWallets()` | **None needed** — already a `SolanaSigner` | [Privy example](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/examples/solana-privy/src/app/page.tsx) |
| `@solana/wallet-adapter-react` `useWallet()` | `fromWalletAdapter({ publicKey, signTransaction })` | `@alchemy/wallet-apis/solana` |
| `window.phantom.solana` (injected provider) | `fromWalletAdapter(provider)` — same adapter, same shape | [Phantom example](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/examples/solana-privy/src/app/phantom-raw/page.tsx) |
| `@solana/kit` `KeyPairSigner` | `fromKitSigner(signer)` | `@alchemy/wallet-apis/solana` |
| Raw Ed25519 keypair / `@solana/web3.js` v1 `Keypair` | `fromKeypair({ address, signMessage })` | `@alchemy/wallet-apis/solana` |
| `@wallet-standard/app` (raw wallet-standard) | Thin inline wrapper (inject `account`, unwrap array) | [Wallet standard example](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/examples/solana-privy/src/app/wallet-standard/page.tsx) |

All adapters are verified to produce identical signed transactions in the [signer equivalence test](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/packages/wallet-apis/src/adapters/signerEquivalence.test.ts).

### Why adapters are needed

`SolanaSigner` takes `Uint8Array` in and out. But the Solana React ecosystem hasn't caught up to wallet-standard:

- **`@solana/wallet-adapter-react`** (what ~90% of React devs use) exposes `signTransaction(VersionedTransaction)` — the legacy `@solana/web3.js` v1 API. `fromWalletAdapter` handles the `Uint8Array` ↔ `VersionedTransaction` conversion.
- **Raw wallet-standard** (`@wallet-standard/app`) requires an `account` param and returns arrays. This is a shape mismatch, not a serialization mismatch.
- **Privy** wraps the wallet-standard wallet internally, so their hook already returns a `SolanaSigner`-compatible object.

### Import paths

```ts
// Shared client factory — works for both EVM and Solana
import {
  createSmartWalletClient,
  alchemyWalletTransport,
} from "@alchemy/wallet-apis";
import type { SolanaSigner } from "@alchemy/wallet-apis";

// Solana-specific actions, adapters, and decorator
import {
  fromWalletAdapter,
  fromKitSigner,
  fromKeypair,
} from "@alchemy/wallet-apis/solana";
import { prepareCalls, sendCalls } from "@alchemy/wallet-apis/solana";
```

---

## Examples

### 1. SDK Client E2E ([`solana-e2e.ts`](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/packages/wallet-apis/src/__tests__/solana-e2e.ts))

Uses `createSmartWalletClient` from `@alchemy/wallet-apis`. This is the highest-level API — it handles prepare, sign, and send internally.

#### What it tests

- **`fromKitSigner`** path — uses an `@solana/kit` `KeyPairSigner` via `generateKeyPairSigner()` + `fromKitSigner()`
- **`fromKeypair`** path — uses a raw Web Crypto Ed25519 key pair (signs only the transaction message bytes)

#### Run it

```bash
ALCHEMY_API_KEY=<your-key> SOLANA_POLICY_ID=<your-policy> \
  bun packages/wallet-apis/src/__tests__/solana-e2e.ts
```

#### What to expect

The script creates two ephemeral key pairs, sends a sponsored 0-lamport self-transfer for each, and waits for on-chain confirmation. You should see output like:

```
Chain: solana:devnet
Policy: <your-policy-id>

=== fromKitSigner (@solana/kit) ===
Signer: <base58-address>
Sending calls...
Call ID: <hex-id>
Waiting for status...
Status: confirmed (200)
Signature: <base58-tx-signature>
fromKitSigner (@solana/kit) passed!

=== fromKeypair (raw Ed25519) ===
Signer: <base58-address>
Sending calls...
Call ID: <hex-id>
Waiting for status...
Status: confirmed (200)
Signature: <base58-tx-signature>
fromKeypair (raw Ed25519) passed!

All tests passed!
```

---

### 2. Raw JSON-RPC E2E ([`solana-raw-rpc-e2e.ts`](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/packages/wallet-apis/src/__tests__/solana-raw-rpc-e2e.ts))

Calls `wallet_prepareCalls`, `wallet_sendPreparedCalls`, and `wallet_getCallsStatus` directly via `fetch`. No SDK client — useful for understanding the wire protocol or building in a language without an SDK.

#### What it tests

- **Raw Ed25519 signing** — extracts message bytes from the serialized transaction and signs with Web Crypto
- **@solana/kit signing** — deserializes the transaction, signs with `KeyPairSigner.signTransactions`

#### Run it

```bash
ALCHEMY_API_KEY=<your-key> SOLANA_POLICY_ID=<your-policy> \
  bun packages/wallet-apis/src/__tests__/solana-raw-rpc-e2e.ts
```

This script logs **full JSON-RPC request and response bodies** for every call. Use it to see exact payloads.

---

### 3. Privy + Next.js Example ([`examples/solana-privy/`](https://github.com/alchemyplatform/aa-sdk/tree/jake/v5/sol-examples/examples/solana-privy))

A minimal Next.js app that logs in with Privy, creates a Solana embedded wallet, and sends a sponsored transaction through the Alchemy smart wallet.

#### Setup

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

#### Run it

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

#### Walkthrough

1. Click **Login with Privy** — sign in with email or Google
2. If no Solana wallet exists, click **Create Solana Wallet**
3. Click **Send Sponsored SOL Transfer** — this sends a 0-lamport self-transfer through the Alchemy smart wallet
4. Watch the status area — you should see the call ID, then confirmation with a Solana transaction signature

#### How the code works

The Privy wallet (`useConnectedStandardWallets`) returns a wallet-standard `StandardConnect` signer. The SDK's `createSmartWalletClient` accepts this directly:

```ts
import {
  createSmartWalletClient,
  alchemyWalletTransport,
} from "@alchemy/wallet-apis";

const client = createSmartWalletClient({
  signer: privyWallet, // wallet-standard signer from Privy
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

### 4. Wallet Standard Example ([`/wallet-standard`](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/examples/solana-privy/src/app/wallet-standard/page.tsx))

Uses `@wallet-standard/app` to discover any installed Solana wallet (Phantom, Solflare, Backpack, etc.) directly — no Privy, no wallet adapter library. This demonstrates that `SolanaSigner` works with any wallet, not just Privy.

#### Run it

Same as the Privy example — `pnpm dev` from `examples/solana-privy/`, then open [http://localhost:3000/wallet-standard](http://localhost:3000/wallet-standard).

#### Walkthrough

1. The page lists all detected browser wallets. Click **Connect \<wallet-name\>**
2. Approve the connection in the wallet popup
3. Click **Send Sponsored SOL Transfer**
4. Approve the transaction signing in the wallet popup
5. Watch the status area for confirmation

#### How the code works

`getWallets()` from `@wallet-standard/app` discovers wallets that register via the wallet-standard protocol. The wallet's `solana:signTransaction` feature already speaks `Uint8Array` in and out — matching `SolanaSigner` with no serialization adapter:

```ts
import { getWallets } from "@wallet-standard/app";

const { get, on } = getWallets();
const solanaWallets = get().filter(
  (w) =>
    "standard:connect" in w.features && "solana:signTransaction" in w.features,
);

// connect
const { accounts } = await wallet.features["standard:connect"].connect();
const account = accounts[0];

// build signer — Uint8Array in, Uint8Array out, no VersionedTransaction dance
const signer = {
  address: account.address,
  signTransaction: async ({ transaction }: { transaction: Uint8Array }) => {
    const [output] = await wallet.features[
      "solana:signTransaction"
    ].signTransaction({ account, transaction });
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

### 5. Raw Phantom Example ([`/phantom-raw`](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/examples/solana-privy/src/app/phantom-raw/page.tsx))

Connects directly to `window.phantom.solana` without any wallet adapter library. This is the most minimal integration — useful for understanding what the adapter layer does under the hood.

#### Prerequisites

[Phantom](https://phantom.app/) must be installed as a browser extension.

#### Run it

Same as the Privy example — `pnpm dev` from `examples/solana-privy/`, then open [http://localhost:3000/phantom-raw](http://localhost:3000/phantom-raw).

#### Walkthrough

1. Click **Connect Phantom** — approve the connection in the Phantom popup
2. Click **Send Sponsored SOL Transfer**
3. Approve the transaction signing in the Phantom popup
4. Watch the status area for confirmation

#### How the code works

Phantom's injected provider (`window.phantom.solana`) exposes `connect()` and `signTransaction(VersionedTransaction)`. The `fromWalletAdapter` adapter from `@alchemy/wallet-apis/solana` handles the `Uint8Array` ↔ `VersionedTransaction` conversion:

```ts
import { fromWalletAdapter } from "@alchemy/wallet-apis/solana";

const phantom = window.phantom?.solana;
await phantom.connect();

const signer = fromWalletAdapter(phantom);
const client = createSmartWalletClient({ signer, transport, chain, paymaster });
```

`fromWalletAdapter` works with any signer that has `{ publicKey: { toBase58() }, signTransaction(VersionedTransaction) }` — including `useWallet()` from `@solana/wallet-adapter-react` and injected providers like Phantom.

---

### Dynamic / other providers

Dynamic's Solana SDK (`@dynamic-labs-sdk/solana`) exposes `signTransaction({ transaction, walletAccount })` — similar to raw wallet-standard (requires `walletAccount`, returns `{ signedTransaction }`). Would need a thin wrapper similar to the wallet-standard case. Dynamic does **not** match `SolanaSigner` directly. Other providers (Capsule, Turnkey, etc.) have not been verified yet.

---

## Troubleshooting

| Symptom                           | Fix                                                                   |
| --------------------------------- | --------------------------------------------------------------------- |
| `Missing ALCHEMY_API_KEY`         | Set the env var before running                                        |
| `RPC error: unauthorized`         | API key doesn't have Wallet APIs enabled                              |
| `RPC error: policy not found`     | Policy ID is wrong or not a Solana devnet policy                      |
| Privy login fails                 | Check `NEXT_PUBLIC_PRIVY_APP_ID` matches your Privy dashboard app     |
| `No Solana embedded wallet found` | Click "Create Solana Wallet" or enable auto-create in Privy dashboard |
| Transaction stays pending         | Devnet can be slow — the script polls for up to 60s                   |
