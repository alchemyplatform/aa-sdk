/**
 * Simple Solana e2e test script. Generates a fresh keypair each run.
 *
 * Usage:
 *   ALCHEMY_API_KEY=<key> SOLANA_POLICY_ID=<id> \
 *     bun packages/wallet-apis/src/__tests__/solana-e2e.ts
 */
import { createSolanaSmartWalletClient } from "../solanaClient.js";
import { alchemyWalletTransport } from "../transport.js";
import type { SolanaSigner } from "../types.js";
import { Base58 } from "ox";

// ── Config ───────────────────────────────────────────────────────────────────

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY!;
const SOLANA_POLICY_ID = process.env.SOLANA_POLICY_ID!;

if (!ALCHEMY_API_KEY) throw new Error("Missing ALCHEMY_API_KEY");
if (!SOLANA_POLICY_ID) throw new Error("Missing SOLANA_POLICY_ID");

// ── Ed25519 signer ──────────────────────────────────────────────────────────

async function generateEd25519Signer(): Promise<SolanaSigner> {
  const keyPair = await crypto.subtle.generateKey("Ed25519", true, [
    "sign",
  ]);

  const rawPublicKey = new Uint8Array(
    await crypto.subtle.exportKey("raw", keyPair.publicKey),
  );
  const address = Base58.fromBytes(rawPublicKey);

  return {
    address,
    async signMessage(message: Uint8Array) {
      return new Uint8Array(
        await crypto.subtle.sign(
          "Ed25519",
          keyPair.privateKey,
          message.buffer as ArrayBuffer,
        ),
      );
    },
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const signer = await generateEd25519Signer();
  const transport = alchemyWalletTransport({
    apiKey: ALCHEMY_API_KEY,
    url: "https://api.g.alchemypreview.com/v2",
  });

  const client = createSolanaSmartWalletClient({
    signer,
    transport,
    chainId: "solana-devnet",
    paymaster: { policyId: SOLANA_POLICY_ID },
  });

  console.log(`Signer: ${signer.address}`);
  console.log("Chain: solana-devnet");
  console.log(`Policy: ${SOLANA_POLICY_ID}`);
  console.log();

  // SystemProgram.transfer instruction (transfer 0 lamports to self)
  // programId: system program
  // data: [u32 instruction_index=2 (Transfer)] [u64 lamports=0]
  const SYSTEM_PROGRAM = "11111111111111111111111111111111";
  const transferData = "0x0200000000000000000000000000" as `0x${string}`;

  // ── sendCalls (one-shot: prepare → sign → send) ────────────────────────
  console.log("--- sendCalls ---");

  const sendResult = await client.sendCalls({
    calls: [
      {
        programId: SYSTEM_PROGRAM,
        accounts: [
          { pubkey: signer.address, isSigner: true, isWritable: true },
          { pubkey: signer.address, isSigner: false, isWritable: true },
        ],
        data: transferData,
      },
    ],
  });

  console.log(`Call ID: ${sendResult.id}`);
  console.log();

  // ── waitForCallsStatus ─────────────────────────────────────────────────
  console.log("--- waitForCallsStatus ---");

  const status = await client.waitForCallsStatus({
    id: sendResult.id,
  });

  console.log(`Status: ${JSON.stringify(status, null, 2)}`);
  console.log();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
