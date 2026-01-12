import { toHex, type Address } from "viem";
import type { SmartWalletSigner } from "../types";
import type { WebAuthnPublicKey } from "@alchemy/wallet-api-types";
import { parsePublicKey } from "webauthn-p256";

export function getSignerAddressOrPublicKey(
  signer: SmartWalletSigner,
):
  | { type: "secp256k1"; address: Address }
  | { type: "webauthn-p256"; publicKey: WebAuthnPublicKey } {
  // SignerClient.
  if ("account" in signer) {
    return {
      type: "secp256k1",
      address: signer.account.address,
    };
  }

  // LocalAccount.
  if (signer.type === "local") {
    return {
      type: "secp256k1",
      address: signer.address,
    };
  }

  // WebAuthnAccount.
  const key = parsePublicKey(signer.publicKey);
  return {
    type: "webauthn-p256",
    publicKey: {
      x: toHex(key.x),
      y: toHex(key.y),
    },
  };
}
