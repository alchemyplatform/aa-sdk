import type { Address } from "abitype";
import type { Hex } from "viem";
import type { SignTypedDataParams } from "../account/types.js";

export interface AuthSmartAccountSigner<Inner, AuthParams, AuthDetails>
  extends SmartAccountSigner<Inner> {
  authenticate: (params: AuthParams) => Promise<AuthDetails>;

  getAuthDetails: () => Promise<AuthDetails>;
}

export interface SmartAccountSigner<Inner> {
  signerType: string;
  inner: Inner;

  getAddress: () => Promise<Address>;

  signMessage: (msg: Uint8Array | Hex | string) => Promise<Hex>;

  signTypedData: (params: SignTypedDataParams) => Promise<Hex>;
}

export const AA_SDK_TESTS_SIGNER_TYPE = "aa-sdk-tests";
