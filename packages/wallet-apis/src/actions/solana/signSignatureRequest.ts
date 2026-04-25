import type { SolanaSigner } from "../../types.js";
import { BaseError } from "@alchemy/common";
import { LOGGER } from "../../logger.js";
import { hexToBytes } from "viem";
import { Base58 } from "ox";

export type SolanaSignatureRequestParams = {
  type: "solana_signTransaction";
  data: `0x${string}`;
};

export type SolanaSignatureResult = {
  type: "ed25519";
  data: string;
};

export async function signSolanaSignatureRequest(
  signer: SolanaSigner,
  signatureRequest: SolanaSignatureRequestParams,
): Promise<SolanaSignatureResult> {
  const txBytes = hexToBytes(signatureRequest.data);

  LOGGER.debug("signSolanaSignatureRequest:signing");

  const [sigDict] = await signer.signTransactions([txBytes]);
  if (!sigDict) {
    throw new BaseError("Solana signer returned no signatures");
  }

  const sigBytes = sigDict[signer.address];
  if (!sigBytes) {
    throw new BaseError(
      `Solana signer did not produce a signature for address ${signer.address}`,
    );
  }

  LOGGER.debug("signSolanaSignatureRequest:ok");
  return {
    type: "ed25519",
    data: Base58.fromBytes(sigBytes),
  };
}
