import { describe, it, expect, vi } from "vitest";
import {
  Keypair,
  MessageV0,
  VersionedTransaction,
  SystemProgram,
} from "@solana/web3.js";

vi.mock("@solana/kit", () => {
  throw new Error("@solana/kit is not installed");
});

const { findSignerSlot } = await import("./resolveSignerSlot.js");

const BLOCKHASH = "11111111111111111111111111111111";

describe("findSignerSlot (@solana/web3.js fallback)", () => {
  it("finds slot 0 for the fee payer (single signer)", async () => {
    const signer = Keypair.generate();
    const msg = MessageV0.compile({
      payerKey: signer.publicKey,
      instructions: [],
      recentBlockhash: BLOCKHASH,
    });
    const txBytes = new VersionedTransaction(msg).serialize();

    expect(await findSignerSlot(txBytes, signer.publicKey.toBase58())).toBe(0);
  });

  it("returns -1 for an address not in the transaction", async () => {
    const signer = Keypair.generate();
    const other = Keypair.generate();
    const msg = MessageV0.compile({
      payerKey: signer.publicKey,
      instructions: [],
      recentBlockhash: BLOCKHASH,
    });
    const txBytes = new VersionedTransaction(msg).serialize();

    expect(await findSignerSlot(txBytes, other.publicKey.toBase58())).toBe(-1);
  });

  it("finds correct slots in a multi-signer transaction", async () => {
    const feePayer = Keypair.generate();
    const signer2 = Keypair.generate();
    const msg = MessageV0.compile({
      payerKey: feePayer.publicKey,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: signer2.publicKey,
          toPubkey: feePayer.publicKey,
          lamports: 1,
        }),
      ],
      recentBlockhash: BLOCKHASH,
    });
    const txBytes = new VersionedTransaction(msg).serialize();

    expect(await findSignerSlot(txBytes, feePayer.publicKey.toBase58())).toBe(
      0,
    );
    expect(await findSignerSlot(txBytes, signer2.publicKey.toBase58())).toBe(
      1,
    );
  });

  it("returns -1 for a non-signer account present in the transaction", async () => {
    const feePayer = Keypair.generate();
    const recipient = Keypair.generate();
    const msg = MessageV0.compile({
      payerKey: feePayer.publicKey,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: feePayer.publicKey,
          toPubkey: recipient.publicKey,
          lamports: 1,
        }),
      ],
      recentBlockhash: BLOCKHASH,
    });
    const txBytes = new VersionedTransaction(msg).serialize();

    expect(
      await findSignerSlot(txBytes, recipient.publicKey.toBase58()),
    ).toBe(-1);
  });
});
