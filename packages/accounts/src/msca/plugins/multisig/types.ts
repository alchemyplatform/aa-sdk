export enum SignerType {
  EOA,
  Contract,
}

export enum UserOpSignatureType {
  Actual,
  UpperLimit,
}

export type Signature = {
  signerType: SignerType;
  userOpSigType: UserOpSignatureType;
  signer: `0x${string}`;
  signature: `0x${string}`;
};
