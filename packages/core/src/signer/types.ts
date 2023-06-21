import type { Address } from "abitype";
import type { Hex } from "viem";

export interface SmartAccountSigner {
  signMessage: (msg: Uint8Array | Hex | string) => Promise<Hex>;
  getAddress: () => Promise<Address>;
}
