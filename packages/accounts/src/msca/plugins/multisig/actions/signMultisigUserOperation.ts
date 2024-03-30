import {
  AccountNotFoundError,
  IncompatibleClientError,
  SmartAccountWithSignerRequiredError,
  isSmartAccountClient,
  isSmartAccountWithSigner,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { concat, type Chain, type Client, type Transport } from "viem";
import {
  type Signature,
  type SignMultisigUserOperationParams,
  type SignMultisigUserOperationResult,
} from "../types.js";
import { formatSignatures, getSignerType } from "../utils.js";

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
  const aggregatedSignature = formatSignatures(signatures.concat(signatureObj));

  return {
    signatureObj,
    signature,
    aggregatedSignature: concat([
      userOperationRequest.preVerificationGas,
      userOperationRequest.maxFeePerGas,
      userOperationRequest.maxPriorityFeePerGas,
      aggregatedSignature,
    ]),
  };
}
