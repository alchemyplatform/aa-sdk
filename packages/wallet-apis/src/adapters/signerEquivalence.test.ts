import { describe, it, expect } from "vitest";
import {
  generateKeyPairSigner,
  createTransactionMessage,
  setTransactionMessageLifetimeUsingBlockhash,
  setTransactionMessageFeePayer,
  compileTransaction,
  getTransactionEncoder,
  type Blockhash,
} from "@solana/kit";
import { fromKeypair } from "./fromKeypair.js";
import { fromKitSigner } from "./fromKitSigner.js";
import type { SolanaStandardSigner } from "../types.js";

async function ed25519Sign(
  key: CryptoKey,
  data: Uint8Array,
): Promise<Uint8Array> {
  const buf = await crypto.subtle.sign("Ed25519", key, new Uint8Array(data));
  return new Uint8Array(buf);
}

describe("Solana signer adapter equivalence", () => {
  it("fromKeypair, fromKitSigner, and raw SolanaStandardSigner all produce the same signed transaction", async () => {
    const kitSigner = await generateKeyPairSigner(true);

    const msg = setTransactionMessageLifetimeUsingBlockhash(
      {
        blockhash: "11111111111111111111111111111111" as Blockhash,
        lastValidBlockHeight: 0n,
      },
      setTransactionMessageFeePayer(
        kitSigner.address,
        createTransactionMessage({ version: 0 }),
      ),
    );
    const compiled = compileTransaction(msg);
    const txBytes = new Uint8Array(getTransactionEncoder().encode(compiled));

    // Adapter 1: fromKitSigner
    const kitAdapted = fromKitSigner(kitSigner);
    const kitResult = await kitAdapted.signTransaction({
      transaction: Uint8Array.from(txBytes),
    });

    // Adapter 2: fromKeypair (raw Ed25519 signMessage)
    const keypairAdapted = fromKeypair({
      address: kitSigner.address,
      signMessage: (message) => ed25519Sign(kitSigner.keyPair.privateKey, message),
    });
    const keypairResult = await keypairAdapted.signTransaction({
      transaction: Uint8Array.from(txBytes),
    });

    // Adapter 3: Direct SolanaStandardSigner (wallet-standard style)
    const directSigner: SolanaStandardSigner = {
      address: kitSigner.address,
      signTransaction: async ({ transaction }) => {
        const numSigs = transaction[0];
        const messageStart = 1 + numSigs * 64;
        const messageBytes = transaction.slice(messageStart);
        const sig = await ed25519Sign(kitSigner.keyPair.privateKey, messageBytes);
        const signedTx = Uint8Array.from(transaction);
        for (let i = 0; i < numSigs; i++) {
          const offset = 1 + i * 64;
          if (transaction.slice(offset, offset + 64).every((b) => b === 0)) {
            signedTx.set(sig, offset);
            return { signedTransaction: signedTx };
          }
        }
        throw new Error("No empty signature slot");
      },
    };
    const directResult = await directSigner.signTransaction({
      transaction: Uint8Array.from(txBytes),
    });

    expect(kitResult.signedTransaction).toEqual(
      keypairResult.signedTransaction,
    );
    expect(kitResult.signedTransaction).toEqual(
      directResult.signedTransaction,
    );

    // Verify the signature slot is actually filled
    const sig = kitResult.signedTransaction.slice(1, 65);
    expect(sig.some((b: number) => b !== 0)).toBe(true);
  });
});
