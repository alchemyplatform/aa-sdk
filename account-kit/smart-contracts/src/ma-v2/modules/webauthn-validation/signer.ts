// Assume:
// const webauthnnSigner = () => ({
//     sign: async (message: string): string => "0x" /** as WebauthnAuthn */
//     signTypedData: async (message: TypedDataThing): string => "0x" /** as WebauthnAuthn */
//   })
// where all methods on webauthnSigner return validationSignature as Hex
//
// TODO: write webauthnSigner

import type { Address, Chain, Hex } from "viem";
import { pack1271Signature, SignatureType } from "../../utils.js";

export const webauthnMessageSigner = (
  validationSignature: Hex,
  chain: Chain,
  accountAddress: Address,
  entityId: number
) => {
  return pack1271Signature({
    validationSignature,
    entityId,
    signatureType: SignatureType.NONE,
  });
};
