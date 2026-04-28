/**
 * Solana e2e test script. Tests both SolanaMessageSigner and SolanaTransactionPartialSigner paths.
 *
 * Usage:
 *   ALCHEMY_API_KEY=<key> SOLANA_POLICY_ID=<id> \
 *     bun packages/wallet-apis/src/__tests__/solana-e2e.ts
 */
import { createSolanaSmartWalletClient } from "../solanaClient.js";
import { alchemyWalletTransport } from "../transport.js";
import type {
  SolanaMessageSigner,
  SolanaTransactionPartialSigner,
} from "../types.js";
import { generateKeyPairSigner } from "@solana/kit";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY!;
const SOLANA_POLICY_ID = process.env.SOLANA_POLICY_ID!;

if (!ALCHEMY_API_KEY) throw new Error("Missing ALCHEMY_API_KEY");
if (!SOLANA_POLICY_ID) throw new Error("Missing SOLANA_POLICY_ID");

const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const TRANSFER_DATA = "0x0200000000000000000000000000" as `0x${string}`;

function createTransport() {
  return alchemyWalletTransport({
    apiKey: ALCHEMY_API_KEY,
    url: "https://api.g.alchemypreview.com/v2",
  });
}

async function sendAndWait(
  label: string,
  signer: SolanaMessageSigner | SolanaTransactionPartialSigner,
) {
  console.log(`\n=== ${label} ===`);
  console.log(`Signer: ${signer.address}`);

  const client = createSolanaSmartWalletClient({
    signer,
    transport: createTransport(),
    chainId: "solana-devnet",
    paymaster: { policyId: SOLANA_POLICY_ID },
  });

  console.log("Sending calls...");
  const sendResult = await client.sendCalls({
    calls: [
      {
        programId: SYSTEM_PROGRAM,
        accounts: [
          { pubkey: signer.address, isSigner: true, isWritable: true },
          { pubkey: signer.address, isSigner: false, isWritable: true },
        ],
        data: TRANSFER_DATA,
      },
    ],
  });
  console.log(`Call ID: ${sendResult.id}`);

  console.log("Waiting for status...");
  const status = await client.waitForCallsStatus({ id: sendResult.id });
  console.log(`Status: ${status.status} (${status.statusCode})`);
  if (status.receipts?.[0]) {
    console.log(`Signature: ${status.receipts[0].signature}`);
  }
  console.log(`${label} passed!\n`);
}

async function main() {
  console.log("Chain: solana-devnet");
  console.log(`Policy: ${SOLANA_POLICY_ID}`);

  // ── Test 1: SolanaTransactionPartialSigner (@solana/kit KeyPairSigner) ──
  const keypairSigner = await generateKeyPairSigner();
  await sendAndWait("TransactionPartialSigner (@solana/kit)", keypairSigner);

  // ── Test 2: SolanaMessageSigner (raw Ed25519) ──────────────────────────
  const rawSigner = await createRawEd25519Signer();
  await sendAndWait("MessageSigner (raw Ed25519)", rawSigner);

  console.log("All tests passed!");
}

async function createRawEd25519Signer(): Promise<SolanaMessageSigner> {
  const { Base58 } = await import("ox");
  const keyPair = await crypto.subtle.generateKey("Ed25519", true, ["sign"]);
  const rawPublicKey = new Uint8Array(
    await crypto.subtle.exportKey("raw", keyPair.publicKey),
  );

  return {
    address: Base58.fromBytes(rawPublicKey),
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

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
