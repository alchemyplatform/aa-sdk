import {
  AccountNotFoundError,
  IncompatibleClientError,
  SmartAccountWithSignerRequiredError,
  isSmartAccountClient,
  isSmartAccountWithSigner,
  type SmartContractAccount,
} from "@aa-sdk/core";
import { type Chain, type Client, type Transport } from "viem";
import { MultisigMissingSignatureError } from "../../../errors.js";
import {
  type SignMultisigUserOperationParams,
  type SignMultisigUserOperationResult,
} from "../types.js";
import { combineSignatures, splitAggregatedSignature } from "../utils/index.js";

export async function signMultisigUserOperation<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  params: SignMultisigUserOperationParams<TAccount>
): Promise<SignMultisigUserOperationResult> {
  const { account = client.account, signatures, userOperationRequest } = params;

  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "SmartAccountClient",
      "signMultisigUserOperation",
      client
    );
  }

  if (!isSmartAccountWithSigner(account)) {
    throw new SmartAccountWithSignerRequiredError();
  }

  if (!signatures.length) {
    throw new MultisigMissingSignatureError();
  }

  const signerAddress = await account.getSigner().getAddress();

  const signedRequest = await client.signUserOperation({
    account,
    uoStruct: userOperationRequest,
    context: {
      aggregatedSignature: combineSignatures({
        signatures,
        upperLimitMaxFeePerGas: userOperationRequest.maxFeePerGas,
        upperLimitMaxPriorityFeePerGas:
          userOperationRequest.maxPriorityFeePerGas,
        upperLimitPvg: userOperationRequest.preVerificationGas,
        usingMaxValues: false,
      }),
      signatures,
      userOpSignatureType: "UPPERLIMIT",
    },
  });

  const splitSignatures = await splitAggregatedSignature({
    account,
    request: signedRequest,
    aggregatedSignature: signedRequest.signature,
    // split works on the assumption that we have t - 1 signatures
    // we have signatures.length + 1 signatures now, so we need sl + 1 + 1
    threshold: signatures.length + 2,
  });

  const signatureObj = splitSignatures.signatures.find(
    (x) => x.signer === signerAddress
  );

  if (!signatureObj) {
    // TODO: strongly type this
    throw new Error(
      "INTERNAL ERROR: signature not found in split signatures, this is an internal bug please report"
    );
  }

  return {
    signatureObj,
    signature: signatureObj.signature,
    aggregatedSignature: signedRequest.signature,
  };
}
