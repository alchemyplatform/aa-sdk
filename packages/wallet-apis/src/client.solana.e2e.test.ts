import { describe, it, expect, beforeAll } from "vitest";
import { createKeyPairSignerFromPrivateKeyBytes } from "@solana/kit";
import { createSmartWalletClient } from "./client.js";
import { fromKeypair } from "./adapters/fromKeypair.js";
import { apiTransport } from "./__tests__/setup.js";
import type { SolanaSmartWalletClient } from "./types.js";
import type { SolanaSendCallsParams } from "./actions/solana/sendCalls.js";
import type { SolanaWaitForCallsStatusResult } from "./actions/solana/waitForCallsStatus.js";

const SYSTEM_PROGRAM = "11111111111111111111111111111111";

function noopTransferCall(from: string) {
  return {
    programId: SYSTEM_PROGRAM,
    data: "0x020000000000000000000000" as `0x${string}`,
    accounts: [
      { pubkey: from, isSigner: true, isWritable: true },
      { pubkey: from, isSigner: false, isWritable: true },
    ],
  };
}

type SendVariant = (
  client: SolanaSmartWalletClient,
  input: SolanaSendCallsParams,
) => Promise<SolanaWaitForCallsStatusResult>;

const sendVariants: SendVariant[] = [
  // sendCalls (high-level)
  async (client, input) => {
    const result = await client.sendCalls(input);
    expect(result.id).toBeDefined();
    return client.waitForCallsStatus({ id: result.id });
  },
  // prepareCalls → signPreparedCalls → sendPreparedCalls
  async (client, input) => {
    const prepared = await client.prepareCalls(input);
    const signed = await client.signPreparedCalls(prepared);
    const result = await client.sendPreparedCalls(signed);
    expect(result.id).toBeDefined();
    return client.waitForCallsStatus({ id: result.id });
  },
];

describe("Solana Client E2E Tests", () => {
  // Fixed 32-byte Ed25519 private key for deterministic signer address.
  const TEST_PRIVATE_KEY = new Uint8Array([
    0xd7, 0xb0, 0x61, 0xef, 0x04, 0xd2, 0x9c, 0xf6, 0x8b, 0x3c, 0x89, 0x35,
    0x66, 0x78, 0xec, 0xce, 0xc9, 0x98, 0x8d, 0xe8, 0xd5, 0xed, 0x89, 0x2c,
    0x19, 0x46, 0x1c, 0x4a, 0x9d, 0x65, 0x92, 0x5d,
  ]);

  let client: SolanaSmartWalletClient;

  beforeAll(async () => {
    const kitSigner = await createKeyPairSignerFromPrivateKeyBytes(
      TEST_PRIVATE_KEY,
      true,
    );

    const signer = fromKeypair({
      address: kitSigner.address,
      signMessage: async (message) => {
        const buf = await crypto.subtle.sign(
          "Ed25519",
          kitSigner.keyPair.privateKey,
          new Uint8Array(message),
        );
        return new Uint8Array(buf);
      },
    });

    client = createSmartWalletClient({
      transport: apiTransport,
      chain: "solana:devnet",
      signer,
      paymaster: {
        policyId: process.env.TEST_SOLANA_PAYMASTER_POLICY_ID!,
      },
    });
  });

  it.each(sendVariants)(
    "should successfully send a Solana transaction with paymaster",
    async (sendVariant) => {
      const result = await sendVariant(client, {
        calls: [noopTransferCall(client.solanaAccount)],
      });

      expect(result.status).toBe("success");
    },
    60_000,
  );

  it.each(sendVariants)(
    "should handle consecutive sends",
    async (sendVariant) => {
      const result1 = await sendVariant(client, {
        calls: [noopTransferCall(client.solanaAccount)],
      });
      expect(result1.status).toBe("success");

      const result2 = await sendVariant(client, {
        calls: [noopTransferCall(client.solanaAccount)],
      });
      expect(result2.status).toBe("success");
    },
    90_000,
  );

  it("should successfully get calls status after send", async () => {
    const { id } = await client.sendCalls({
      calls: [noopTransferCall(client.solanaAccount)],
    });

    const status = await client.getCallsStatus({ id });
    expect(["pending", "success"]).toContain(status.status);

    const finalStatus = await client.waitForCallsStatus({ id });
    expect(finalStatus.status).toBe("success");
    expect(finalStatus.receipts).toBeDefined();
  }, 60_000);

  it("prepareCalls returns a solana-transaction-v0 type", async () => {
    const prepared = await client.prepareCalls({
      calls: [noopTransferCall(client.solanaAccount)],
    });

    expect(prepared.type).toBe("solana-transaction-v0");
    expect(prepared.signatureRequest.type).toBe("solana_signTransaction");
    expect(prepared.signatureRequest.data).toMatch(/^0x/);
    expect(prepared.data.version).toBe("0");
    expect(prepared.data.signer).toBeDefined();
    expect(prepared.data.compiledTransaction).toMatch(/^0x/);
  }, 60_000);

  it("signPreparedCalls produces an ed25519 signature", async () => {
    const prepared = await client.prepareCalls({
      calls: [noopTransferCall(client.solanaAccount)],
    });
    const signed = await client.signPreparedCalls(prepared);

    expect(signed.type).toBe("solana-transaction-v0");
    expect(signed.signature.type).toBe("ed25519");
    expect(signed.signature.data).toBeTruthy();
  }, 60_000);
});
