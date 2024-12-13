import { type Hex, concat } from "viem";

export type PackSignatureParams = {
  // orderedHookData: HookData[];
  validationSignature: Hex;
};

// Signature packing utility
export const packSignature = ({
  // orderedHookData, TO DO: integrate in next iteration of MAv2 sdk
  validationSignature,
}: PackSignatureParams): Hex => {
  return concat(["0xFF", "0x00", validationSignature]);
};
