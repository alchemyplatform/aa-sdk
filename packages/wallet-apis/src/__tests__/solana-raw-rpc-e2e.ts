/**
 * Solana e2e test using raw RPC calls (fetch) instead of the SDK client.
 * Shows how to call wallet_prepareCalls, sign, and wallet_sendPreparedCalls directly.
 * Tests both raw Ed25519 signing and @solana/kit KeyPairSigner.
 *
 * Usage:
 *   ALCHEMY_API_KEY=<key> SOLANA_POLICY_ID=<id> \
 *     bun packages/wallet-apis/src/__tests__/solana-raw-rpc-e2e.ts
 */
import { Base58 } from "ox";
import {
  generateKeyPairSigner,
  getTransactionCodec,
  type KeyPairSigner,
} from "@solana/kit";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY!;
const SOLANA_POLICY_ID = process.env.SOLANA_POLICY_ID!;
const RPC_URL = `https://api.g.alchemypreview.com/v2/${ALCHEMY_API_KEY}`;

if (!ALCHEMY_API_KEY) throw new Error("Missing ALCHEMY_API_KEY");
if (!SOLANA_POLICY_ID) throw new Error("Missing SOLANA_POLICY_ID");

const SYSTEM_PROGRAM = "11111111111111111111111111111111";

async function rpc(method: string, params: unknown[]) {
  const request = { jsonrpc: "2.0", id: 1, method, params };
  console.log(`\n>>> REQUEST: ${method}`);
  console.log(JSON.stringify(request, null, 2));

  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const json = await res.json();

  console.log(`\n<<< RESPONSE: ${method}`);
  console.log(JSON.stringify(json, null, 2));

  if (json.error) {
    throw new Error(`RPC error: ${JSON.stringify(json.error)}`);
  }
  return json.result;
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function prepareCalls(address: string) {
  return rpc("wallet_prepareCalls", [
    {
      calls: [
        {
          programId: SYSTEM_PROGRAM,
          accounts: [
            { pubkey: address, isSigner: true, isWritable: true },
            { pubkey: address, isSigner: false, isWritable: true },
          ],
          data: "0x0200000000000000000000000000",
        },
      ],
      chainId: "solana:devnet",
      from: address,
      capabilities: {
        paymasterService: { policyId: SOLANA_POLICY_ID },
      },
    },
  ]);
}

async function sendPreparedCalls(
  prepareResult: Record<string, unknown>,
  signatureBase58: string,
) {
  return rpc("wallet_sendPreparedCalls", [
    {
      type: prepareResult.type,
      chainId: prepareResult.chainId,
      data: prepareResult.data,
      signature: { type: "ed25519", data: signatureBase58 },
    },
  ]);
}

async function pollStatus(callId: string) {
  for (let i = 0; i < 30; i++) {
    const status = await rpc("wallet_getCallsStatus", [callId]);
    if (status.status >= 200) {
      console.log(
        `Status: ${status.status >= 300 ? "failure" : "success"} (${status.status})`,
      );
      if (status.receipts?.[0]) {
        console.log(`Tx Signature: ${status.receipts[0].signature}`);
      }
      return status;
    }
    console.log(`  Poll ${i + 1}: pending (${status.status})`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Timed out waiting for confirmation");
}

// ── Test 1: Raw Ed25519 signing ──────────────────────────────────────────────

async function testRawEd25519() {
  console.log("\n=== Raw Ed25519 signing ===");

  const keyPair = await crypto.subtle.generateKey("Ed25519", true, ["sign"]);
  const rawPublicKey = new Uint8Array(
    await crypto.subtle.exportKey("raw", keyPair.publicKey),
  );
  const address = Base58.fromBytes(rawPublicKey);
  console.log(`Signer: ${address}`);

  // 1. Prepare
  console.log("Preparing calls...");
  const prepareResult = await prepareCalls(address);
  console.log(`Sponsored: ${prepareResult.feePayment.sponsored}`);

  // 2. Sign — extract message bytes, sign with Ed25519
  const txBytes = hexToBytes(prepareResult.signatureRequest.data);
  const numSigs = txBytes[0];
  const messageBytes = txBytes.slice(1 + numSigs * 64);

  const sigBytes = new Uint8Array(
    await crypto.subtle.sign(
      "Ed25519",
      keyPair.privateKey,
      messageBytes.buffer,
    ),
  );
  const signatureBase58 = Base58.fromBytes(sigBytes);
  console.log(`Signed (raw Ed25519)`);

  // 3. Send
  console.log("Sending...");
  const sendResult = await sendPreparedCalls(prepareResult, signatureBase58);
  console.log(`Call ID: ${sendResult.id}`);

  // 4. Poll
  console.log("Waiting for status...");
  await pollStatus(sendResult.id);
  console.log("Raw Ed25519 passed!\n");
}

// ── Test 2: @solana/kit KeyPairSigner ────────────────────────────────────────

async function testSolKitSigner() {
  console.log("\n=== @solana/kit KeyPairSigner ===");

  const signer: KeyPairSigner = await generateKeyPairSigner();
  const address = signer.address;
  console.log(`Signer: ${address}`);

  // 1. Prepare
  console.log("Preparing calls...");
  const prepareResult = await prepareCalls(address);
  console.log(`Sponsored: ${prepareResult.feePayment.sponsored}`);

  // 2. Sign — deserialize tx, use KeyPairSigner.signTransactions
  const txBytes = hexToBytes(prepareResult.signatureRequest.data);
  const codec = getTransactionCodec();
  const transaction = codec.decode(txBytes);

  const [sigDict] = await signer.signTransactions([transaction]);
  const sig = sigDict[address];
  if (!sig) throw new Error(`No signature for ${address}`);
  const signatureBase58 = Base58.fromBytes(sig);
  console.log(`Signed (@solana/kit)`);

  // 3. Send
  console.log("Sending...");
  const sendResult = await sendPreparedCalls(prepareResult, signatureBase58);
  console.log(`Call ID: ${sendResult.id}`);

  // 4. Poll
  console.log("Waiting for status...");
  await pollStatus(sendResult.id);
  console.log("@solana/kit KeyPairSigner passed!\n");
}

// ── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Policy: ${SOLANA_POLICY_ID}`);

  await testRawEd25519();
  await testSolKitSigner();

  console.log("All raw RPC tests passed!");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
