import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  isSmartAccountWithSigner,
  SmartAccountWithSignerRequiredError,
  type GetEntryPointFromAccount,
  type SendUserOperationParameters,
  type SmartContractAccount,
  type UserOperationOverrides,
} from "@alchemy/aa-core";
import { type Chain, type Client, type Transport } from "viem";
import { combineSignatures, getSignerType } from "../index.js";
import { type ProposeUserOperationResult, type Signature } from "../types.js";

export async function proposeUserOperation<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  client: Client<TTransport, TChain, TAccount>,
  {
    uo,
    account = client.account,
    overrides: overrides_,
  }: SendUserOperationParameters<TAccount, undefined>
): Promise<ProposeUserOperationResult> {
  // these overrides allow us to set a high max fee and PVG upper bound
  const overrides = {
    maxFeePerGas: { multiplier: 3 },
    maxPriorityFeePerGas: { multiplier: 2 },
    preVerificationGas: { multiplier: 1000 },
    ...overrides_,
  } as UserOperationOverrides<TEntryPointVersion>;

  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "SmartAccountClient",
      "proposeUserOperation",
      client
    );
  }

  if (!isSmartAccountWithSigner(account)) {
    throw new SmartAccountWithSignerRequiredError();
  }

  const builtUo = await client.buildUserOperation({
    account,
    uo,
    overrides,
  });

  const request = await client.signUserOperation({
    uoStruct: builtUo,
    account,
  });

  const signerType = await getSignerType({
    client,
    signature: request.signature,
    signer: account.getSigner(),
  });

  const signatureObj: Signature = {
    signature: request.signature,
    signer: await account.getSigner().getAddress(),
    signerType,
    userOpSigType: "UPPERLIMIT",
  };

  return {
    request,
    signatureObj,
    aggregatedSignature: combineSignatures({
      signatures: [signatureObj],
      upperLimitMaxFeePerGas: request.maxFeePerGas,
      upperLimitMaxPriorityFeePerGas: request.maxPriorityFeePerGas,
      upperLimitPvg: request.preVerificationGas,
    }),
  };
}
