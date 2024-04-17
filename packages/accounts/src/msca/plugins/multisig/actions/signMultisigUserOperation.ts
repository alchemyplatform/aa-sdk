import {
  AccountNotFoundError,
  IncompatibleClientError,
  SmartAccountWithSignerRequiredError,
  isSmartAccountClient,
  isSmartAccountWithSigner,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { type Chain, type Client, type Transport } from "viem";
import { MultisigMissingSignatureError } from "../../../errors.js";
import { combineSignatures, getSignerType } from "../index.js";
import {
  type SignMultisigUserOperationParams,
  type SignMultisigUserOperationResult,
  type Signature,
} from "../types.js";

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

  const ep = account.getEntryPoint();
  const uoHash = ep.getUserOperationHash(userOperationRequest);
  const signature = await account.signUserOperationHash(uoHash);
  const signerAddress = await account.getSigner().getAddress();
  const signerType = await getSignerType({
    client,
    signature,
    signer: account.getSigner(),
  });

  const signatureObj: Signature = {
    signerType,
    signer: signerAddress,
    signature,
    userOpSigType: "UPPERLIMIT",
  };

  return {
    signatureObj,
    signature,
    aggregatedSignature: combineSignatures({
      signatures: [...signatures, signatureObj],
      upperLimitMaxFeePerGas: userOperationRequest.maxFeePerGas,
      upperLimitMaxPriorityFeePerGas: userOperationRequest.maxPriorityFeePerGas,
      upperLimitPvg: userOperationRequest.preVerificationGas,
    }),
  };
}
