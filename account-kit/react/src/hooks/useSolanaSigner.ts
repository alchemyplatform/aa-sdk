import type { AlchemySigner, SignerStatus } from "@account-kit/core";
import { useSigner } from "./useSigner.js";
import { useSignerStatus } from "./useSignerStatus.js";
import * as web3 from "@solana/web3.js";
import { useMemo } from "react";
import type { SolanaSigner } from "@account-kit/signer";
export interface TransactionSigner {
  readonly state: "pending" | "ready";
  signTransaction(transaction: web3.Transaction): Promise<web3.Transaction>;
}

export interface MessageSigner {
  readonly state: "pending" | "ready";
  signMessage: (message: string) => Promise<{ signedMessage: unknown }>;
}

export type SignerSet = {
  signer: AlchemySigner | null;
  signerStatus: SignerStatus;
};

/**
 * This hook is used to create a SolanaSigner instance.
 * It is used to sign transactions and messages for the Solana blockchain.
 *
 * @param {object?} opts - The options for the useSolanaSigner hook.
 * @param {SignerSet} [opts.signerSet] - The signer set to use.
 * @returns {object} A SolanaSigner instance.
 */
export const useSolanaSigner = (
  opts: {
    signerSet?: SignerSet; // Used to set a shared signer
  } = {}
): null | SolanaSigner => {
  const fallbackSigner = useSigner();
  const fallbackSignerStatus = useSignerStatus();
  const solanaSigner: SolanaSigner | null = useMemo(() => {
    const signer = opts.signerSet?.signer || fallbackSigner;
    const signerStatus = opts.signerSet?.signerStatus || fallbackSignerStatus;
    if (!signer) return null;
    if (!signerStatus.isConnected) return null;
    return signer.toSolanaSigner();
  }, [
    opts.signerSet?.signer,
    opts.signerSet?.signerStatus,
    fallbackSigner,
    fallbackSignerStatus,
  ]);

  return solanaSigner;
};
