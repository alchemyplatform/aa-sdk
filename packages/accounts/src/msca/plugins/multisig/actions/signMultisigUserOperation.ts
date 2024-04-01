import {
  AccountNotFoundError,
  IncompatibleClientError,
  SmartAccountWithSignerRequiredError,
  isSmartAccountClient,
  isSmartAccountWithSigner,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { type Chain, type Client, type Transport } from "viem";
import {
  type Signature,
  type SignMultisigUserOperationParams,
  type SignMultisigUserOperationResult,
} from "../types.js";
import { combineSignatures, getSignerType } from "../utils.js";

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
    // TODO: need to convert this to one of the strongly typed errors
    throw new Error("UserOp must have at least one signature already");
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
