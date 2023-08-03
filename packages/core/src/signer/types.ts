import type { Address } from "abitype";
import type { Hash, Hex } from "viem";
import type { SignTypedDataParameters } from "viem/accounts";

export interface SmartAccountSigner {
  signMessage: (msg: Uint8Array | Hex | string) => Promise<Hash>;
  signTypedData: (
    params: Omit<SignTypedDataParameters, "privateKey">
  ) => Promise<Hash>;
  getAddress: () => Promise<Address>;
}
