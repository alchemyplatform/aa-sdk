import { describe, it, expect } from "vitest";
import {
  generateKeyPairSigner,
  createTransactionMessage,
  setTransactionMessageLifetimeUsingBlockhash,
  setTransactionMessageFeePayer,
  compileTransaction,
  getTransactionEncoder,
  appendTransactionMessageInstruction,
  type Blockhash,
  type Address,
} from "@solana/kit";
import { findSignerSlot } from "./resolveSignerSlot.js";

const BLOCKHASH_LIFETIME = {
  blockhash: "11111111111111111111111111111111" as Blockhash,
  lastValidBlockHeight: 0n,
};

function encodeTx(msg: Parameters<typeof compileTransaction>[0]): Uint8Array {
  return new Uint8Array(
    getTransactionEncoder().encode(compileTransaction(msg)),
  );
}

describe("findSignerSlot", () => {
  it("finds slot 0 for the fee payer (single signer)", async () => {
    const signer = await generateKeyPairSigner(true);
    const msg = setTransactionMessageLifetimeUsingBlockhash(
      BLOCKHASH_LIFETIME,
      setTransactionMessageFeePayer(
        signer.address,
        createTransactionMessage({ version: 0 }),
      ),
    );
    expect(await findSignerSlot(encodeTx(msg), signer.address)).toBe(0);
  });

  it("returns -1 for an address not in the transaction", async () => {
    const signer = await generateKeyPairSigner(true);
    const other = await generateKeyPairSigner(true);
    const msg = setTransactionMessageLifetimeUsingBlockhash(
      BLOCKHASH_LIFETIME,
      setTransactionMessageFeePayer(
        signer.address,
        createTransactionMessage({ version: 0 }),
      ),
    );
    expect(await findSignerSlot(encodeTx(msg), other.address)).toBe(-1);
  });

  it("finds correct slots in a multi-signer transaction", async () => {
    const feePayer = await generateKeyPairSigner(true);
    const signer2 = await generateKeyPairSigner(true);

    const msg = appendTransactionMessageInstruction(
      {
        programAddress: "11111111111111111111111111111111" as Address,
        accounts: [{ address: signer2.address, role: 3 /* writable signer */ }],
      },
      setTransactionMessageLifetimeUsingBlockhash(
        BLOCKHASH_LIFETIME,
        setTransactionMessageFeePayer(
          feePayer.address,
          createTransactionMessage({ version: 0 }),
        ),
      ),
    );

    const txBytes = encodeTx(msg);
    expect(await findSignerSlot(txBytes, feePayer.address)).toBe(0);
    expect(await findSignerSlot(txBytes, signer2.address)).toBe(1);
  });

  it("returns -1 for a non-signer account present in the transaction", async () => {
    const feePayer = await generateKeyPairSigner(true);
    const nonSigner = await generateKeyPairSigner(true);

    const msg = appendTransactionMessageInstruction(
      {
        programAddress: "11111111111111111111111111111111" as Address,
        accounts: [
          { address: nonSigner.address, role: 1 /* writable non-signer */ },
        ],
      },
      setTransactionMessageLifetimeUsingBlockhash(
        BLOCKHASH_LIFETIME,
        setTransactionMessageFeePayer(
          feePayer.address,
          createTransactionMessage({ version: 0 }),
        ),
      ),
    );

    const txBytes = encodeTx(msg);
    expect(await findSignerSlot(txBytes, nonSigner.address)).toBe(-1);
  });
});
