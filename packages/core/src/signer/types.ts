import type { Address } from "abitype";
import type { Hash, Hex } from "viem";
import type { SignTypedDataParams } from "../account/types.js";

export interface SmartAccountSigner {
  signerType: string;
  signMessage: (msg: Uint8Array | Hex | string) => Promise<Hash>;
  signTypedData: (params: SignTypedDataParams) => Promise<Hash>;
  getAddress: () => Promise<Address>;
}

export const AA_SDK_TESTS_SIGNER_TYPE = "aa-sdk-tests";
