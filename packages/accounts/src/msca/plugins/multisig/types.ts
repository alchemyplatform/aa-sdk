import type {
  GetAccountParameter,
  Hex,
  SmartContractAccount,
  UserOperationRequest,
} from "@alchemy/aa-core";
import type { GetPluginAddressParameter } from "../types";

export type SignerType = "EOA" | "CONTRACT";

export type UserOpSignatureType = "ACTUAL" | "UPPERLIMIT";

export type Signature = {
  signerType: SignerType;
  userOpSigType: UserOpSignatureType;
  signer: `0x${string}`;
  signature: `0x${string}`;
};

export type SignMultisigUserOperationResult = {
  signature: Hex;
  aggregatedSignature: Hex;
  signatureObj: Signature;
};

export type SignMultisigUserOperationParams<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  userOperationRequest: UserOperationRequest;
  signatures: Signature[];
} & GetAccountParameter<TAccount> &
  GetPluginAddressParameter;

export type ProposeUserOperationResult = {
  request: UserOperationRequest;
  aggregatedSignature: Hex;
  signatureObj: Signature;
};

export type MultisigUserOperationContext = {
  signature: Hex;
};
