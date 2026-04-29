# [Wallet APIs] Solana API Spec, SDK Implementation, & Dogfooding Guide

API shape, real request/response examples, and five runnable demos for Solana smart wallets.

All examples use the **Alchemy Wallet APIs preview endpoint** on **Solana devnet**.

---

## Prerequisites

| What                                  | Where to get it                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| **Alchemy API key**                   | Dashboard — must have Wallet APIs enabled                                      |
| **Solana policy ID**                  | Gas Manager → create a Solana devnet sponsorship policy                        |
| **Privy app ID** (Privy example only) | [Privy dashboard](https://dashboard.privy.io) — enable Solana embedded wallets |
| **bun** (CLI examples)                |                                                                                |
| **Node 22+** (React examples)         |                                                                                |

---

## API Shape

### Common Types

#### `SolanaChainId`

```
"solana:mainnet" | "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"   // Mainnet
"solana:devnet"  | "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"   // Devnet
```

#### `SolanaAddress`

Base58-encoded string, 32-44 characters.

#### `SolanaInstruction`

```jsonc
{
  "programId": SolanaAddress,
  "accounts?": [
    {
      "pubkey": SolanaAddress,
      "isSigner": boolean,
      "isWritable": boolean
    }
  ],
  "data": Hex
}
```

#### `StatusCode`

| Code | Title            | Description                                                    |
| ---- | ---------------- | -------------------------------------------------------------- |
| 100  | Pending          | Submitted but not yet confirmed                                |
| 200  | Confirmed        | Included on-chain successfully                                 |
| 400  | Offchain Failure | Not included on-chain, will not retry (e.g. expired blockhash) |
| 500  | Onchain Failure  | Reverted completely on-chain                                   |

> Codes 110, 115, 116, 120, 410, 600 exist in the union but are EVM/cross-chain specific.

---

### wallet_prepareCalls

#### Request

```jsonc
{
  "method": "wallet_prepareCalls",
  "params": [
    {
      "calls": SolanaInstruction[],
      "from": SolanaAddress,
      "chainId": SolanaChainId,
      "addressLookupTableAddresses?": SolanaAddress[],
      "capabilities?": {
        "paymasterService?": {        // enables fee sponsorship
          "policyId": string,
          "webhookData?": string
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
    "data": Hex
  },
  "data": {
    "compiledTransaction": Hex,
    "signer": SolanaAddress,
    "version": "0",
    "lifetimeConstraint": {
      "blockHash": string,
      "lastValidBlockHeight?": Hex
    }
  },
  "feePayment": {
    "sponsored": boolean,
    "feePayer": SolanaAddress
  },
  "details": {
    "type": "solana-transaction-v0",
    "data": {
      "calls": SolanaInstruction[],
      "addressLookupTableAddresses?": SolanaAddress[]
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
        "compiledTransaction": Hex,
        "signer": SolanaAddress,
        "version": "0",
        "lifetimeConstraint": {
          "blockHash": string,
          "lastValidBlockHeight?": Hex
        }
      },
      "signature": {
        "type": "ed25519",
        "data": string
      }
    }
  ]
}
```

#### Response

```jsonc
{
  "id": Hex,
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
  "params": [Hex]
}
```

#### Response

```jsonc
{
  "id": Hex,
  "chainId": SolanaChainId,
  "atomic": boolean,
  "status": StatusCode,
  "commitment?": "processed" | "confirmed" | "finalized",
  "receipts?": [
    {
      "signature": string,
      "blockTime?": Hex,
      "slot": Hex
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

#### wallet_prepareCalls — request

Sponsored 0-lamport self-transfer via the System Program — simplest possible instruction to exercise the full flow.

```json
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
            {
              "pubkey": "J8tXRgztWDQWapi7teAxmpx4cH3caJRfckyCBTdUpU3f",
              "isSigner": true,
              "isWritable": true
            },
            {
              "pubkey": "J8tXRgztWDQWapi7teAxmpx4cH3caJRfckyCBTdUpU3f",
              "isSigner": false,
              "isWritable": true
            }
          ],
          "data": "0x0200000000000000000000000000"
        }
      ],
      "chainId": "solana:devnet",
      "from": "J8tXRgztWDQWapi7teAxmpx4cH3caJRfckyCBTdUpU3f",
      "capabilities": {
        "paymasterService": {
          "policyId": "850a7066-30d4-49d8-8672-521319d86f5a"
        }
      }
    }
  ]
}
```

#### wallet_prepareCalls — response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "type": "solana-transaction-v0",
    "chainId": "solana:devnet",
    "signatureRequest": {
      "type": "solana_signTransaction",
      "data": "0x020784602a94bd4715680f44f4169abf36b4ee37407c6806a737859bc6a5b803221b2826ad5d8d08a30c1ed112fe743976383ddd99a8d3884e94be6b7e2893200d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800200010314f223f56f8a396dc5ca02028ede46d3c78161db1856f9dc5f63791527f89ed0fe9c009ff4130a712570159f1b2f31dd1cb3a1481c3f6469f856baf8f7cb666e0000000000000000000000000000000000000000000000000000000000000000cde22751157e9ad919cbe6676978684fdd2348e686ea363b4e4e608d586cbbc301020201010e020000000000000000000000000000"
    },
    "data": {
      "compiledTransaction": "0x020784602a94bd4715680f44f4169abf36b4ee37407c6806a737859bc6a5b803221b2826ad5d8d08a30c1ed112fe743976383ddd99a8d3884e94be6b7e2893200d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800200010314f223f56f8a396dc5ca02028ede46d3c78161db1856f9dc5f63791527f89ed0fe9c009ff4130a712570159f1b2f31dd1cb3a1481c3f6469f856baf8f7cb666e0000000000000000000000000000000000000000000000000000000000000000cde22751157e9ad919cbe6676978684fdd2348e686ea363b4e4e608d586cbbc301020201010e020000000000000000000000000000",
      "signer": "J8tXRgztWDQWapi7teAxmpx4cH3caJRfckyCBTdUpU3f",
      "version": "0",
      "lifetimeConstraint": {
        "blockHash": "ErgbBnrLVthAKiGoPZ7PFDxPxd9MBqZt2Z6pJbJQeRxN",
        "lastValidBlockHeight": "0x1aa23b09"
      }
    },
    "feePayment": {
      "sponsored": true,
      "feePayer": "2QmJeMox1MU8X9hqvQj3JqWvYfJcGUYyAgZtTuvKhT3u"
    },
    "details": {
      "type": "solana-transaction-v0",
      "data": {
        "calls": [
          {
            "programId": "11111111111111111111111111111111",
            "accounts": [
              {
                "pubkey": "J8tXRgztWDQWapi7teAxmpx4cH3caJRfckyCBTdUpU3f",
                "isSigner": true,
                "isWritable": true
              },
              {
                "pubkey": "J8tXRgztWDQWapi7teAxmpx4cH3caJRfckyCBTdUpU3f",
                "isSigner": true,
                "isWritable": true
              }
            ],
            "data": "0x0200000000000000000000000000"
          }
        ]
      }
    }
  }
}
```

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

## SDK Signer Interface: `SolanaSigner`

The simplest possible interface:

```ts
interface SolanaSigner {
  address: string;
  signTransaction(input: {
    transaction: Uint8Array;
  }): Promise<{ signedTransaction: Uint8Array }>;
}
```

Adapters in `@alchemy/wallet-apis/solana` convert various signer sources into this interface:

| What you have                                        | Adapter                                                                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Privy `useConnectedStandardWallets()`                | **None needed** — already a `SolanaSigner` ([example](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/examples/solana-privy/src/app/page.tsx))        |
| `@solana/wallet-adapter-react` `useWallet()`         | `fromWalletAdapter({ publicKey, signTransaction })`                                                                                                                       |
| `window.phantom.solana` (injected provider)          | `fromWalletAdapter(provider)` ([example](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/examples/solana-privy/src/app/phantom-raw/page.tsx))         |
| `@solana/kit` `KeyPairSigner`                        | `fromKitSigner(signer)` ([example](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/packages/wallet-apis/src/__tests__/solana-e2e.ts))                 |
| Raw Ed25519 keypair / `@solana/web3.js` v1 `Keypair` | `fromKeypair({ address, signMessage })` ([example](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/packages/wallet-apis/src/__tests__/solana-e2e.ts)) |
| `@wallet-standard/app` (low-level, for library authors) | Thin inline wrapper ([example](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/examples/solana-privy/src/app/wallet-standard/page.tsx))               |

All adapters are verified to produce identical signed transactions in the [signer equivalence test](https://github.com/alchemyplatform/aa-sdk/blob/jake/v5/sol-examples/packages/wallet-apis/src/adapters/signerEquivalence.test.ts).

#### Privy (no adapter needed)

```ts
import { useConnectedStandardWallets } from "@privy-io/react-auth/solana";

const { wallets } = useConnectedStandardWallets();
const signer = wallets[0]; // already a SolanaSigner
```

#### `@solana/wallet-adapter-react`

```ts
import { useWallet } from "@solana/wallet-adapter-react";
import { fromWalletAdapter } from "@alchemy/wallet-apis/solana";

const wallet = useWallet();
const signer = fromWalletAdapter(wallet); // needs @solana/web3.js
```

#### `window.phantom.solana`

```ts
import { fromWalletAdapter } from "@alchemy/wallet-apis/solana";

const phantom = window.phantom?.solana;
await phantom.connect();
const signer = fromWalletAdapter(phantom); // same adapter, same shape
```

#### `@solana/kit` KeyPairSigner

```ts
import { generateKeyPairSigner } from "@solana/kit";
import { fromKitSigner } from "@alchemy/wallet-apis/solana";

const kitSigner = await generateKeyPairSigner();
const signer = fromKitSigner(kitSigner); // needs @solana/kit
```

#### Raw Ed25519 keypair

```ts
import { fromKeypair } from "@alchemy/wallet-apis/solana";

const signer = fromKeypair({
  address: base58PublicKey,
  signMessage: async (message) => {
    return new Uint8Array(
      await crypto.subtle.sign("Ed25519", privateKey, message),
    );
  },
}); // no Solana libs needed
```

#### `@wallet-standard/app` (low-level, for library authors)

```ts
import { getWallets } from "@wallet-standard/app";

const wallet = getWallets().get().find(/* has solana:signTransaction */);
const { accounts } = await wallet.features["standard:connect"].connect();
const account = accounts[0];

const signer = {
  address: account.address,
  signTransaction: async ({ transaction }: { transaction: Uint8Array }) => {
    const [output] = await wallet.features[
      "solana:signTransaction"
    ].signTransaction({ account, transaction });
    return output;
  },
};
```

### Why adapters are needed

`SolanaSigner` takes `Uint8Array` in and out. But the Solana React ecosystem hasn't caught up to wallet-standard:

- **`@solana/wallet-adapter-react`** (what ~90% of React devs use) exposes `signTransaction(VersionedTransaction)` — the legacy `@solana/web3.js` v1 API. `fromWalletAdapter` handles the `Uint8Array` ↔ `VersionedTransaction` conversion.
- **Raw wallet-standard** (`@wallet-standard/app`) is a low-level API for library authors, not typical app devs. It requires an `account` param and returns arrays — a shape mismatch, not a serialization mismatch.
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

#### Simplest example

```ts
import { generateKeyPairSigner } from "@solana/kit";
import { fromKitSigner } from "@alchemy/wallet-apis/solana";
import { createSmartWalletClient, alchemyWalletTransport } from "@alchemy/wallet-apis";

const signer = fromKitSigner(await generateKeyPairSigner());

const client = createSmartWalletClient({
  signer,
  transport: alchemyWalletTransport({ apiKey: ALCHEMY_API_KEY }),
  chain: "solana:devnet",
  paymaster: { policyId: SOLANA_POLICY_ID },
});

const { id } = await client.sendCalls({ calls: [/* ... */] });
const result = await client.waitForCallsStatus({ id });
```

#### What it tests

- **`fromKitSigner`** path — `generateKeyPairSigner()` + `fromKitSigner()`
- **`fromKeypair`** path — raw Web Crypto Ed25519 key pair (signs only the transaction message bytes)

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

#### Zero-dependency signing (any language)

The raw Ed25519 test shows the minimal signing path — no Solana libraries needed. This is the pattern to follow if you're calling the API from Python, Go, Rust, etc.:

```ts
// 1. Generate an Ed25519 keypair (Web Crypto, or your language's equivalent)
const keyPair = await crypto.subtle.generateKey("Ed25519", true, ["sign"]);
const rawPublicKey = new Uint8Array(
  await crypto.subtle.exportKey("raw", keyPair.publicKey),
);
const address = Base58.fromBytes(rawPublicKey);

// 2. Call wallet_prepareCalls, get back signatureRequest.data (hex)
const txBytes = hexToBytes(prepareResult.signatureRequest.data);

// 3. Extract the message bytes from the serialized transaction
const numSigs = txBytes[0];
const messageBytes = txBytes.slice(1 + numSigs * 64);

// 4. Sign the message bytes with Ed25519
const sigBytes = new Uint8Array(
  await crypto.subtle.sign("Ed25519", keyPair.privateKey, messageBytes),
);

// 5. Base58-encode the signature, pass to wallet_sendPreparedCalls
const signatureBase58 = Base58.fromBytes(sigBytes);
```

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
import { useConnectedStandardWallets } from "@privy-io/react-auth/solana";
import {
  createSmartWalletClient,
  alchemyWalletTransport,
} from "@alchemy/wallet-apis";

const { wallets } = useConnectedStandardWallets();
const privyWallet = wallets[0]; // already a SolanaSigner

const client = createSmartWalletClient({
  signer: privyWallet,
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

// build signer — Uint8Array in, Uint8Array out, no VersionedTransaction
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
