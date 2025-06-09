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
} from "@aa-sdk/core";
import { type Chain, type Client, type Transport } from "viem";
import { type ProposeUserOperationResult } from "../types.js";
import { splitAggregatedSignature } from "../utils/splitAggregatedSignature.js";

export async function proposeUserOperation<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends
    GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
>(
  client: Client<TTransport, TChain, TAccount>,
  {
    uo,
    account = client.account,
    overrides: overrides_,
  }: SendUserOperationParameters<TAccount, undefined>,
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
      client,
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
    context: {
      userOpSignatureType: "UPPERLIMIT",
    },
  });

  const splitSignatures = await splitAggregatedSignature({
    request,
    aggregatedSignature: request.signature,
    account,
    // split works on the assumption that we have t - 1 signatures
    threshold: 2,
  });

  return {
    request,
    signatureObj: splitSignatures.signatures[0],
    aggregatedSignature: request.signature,
  };
}
