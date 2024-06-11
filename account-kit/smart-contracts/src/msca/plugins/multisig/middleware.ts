import {
  InvalidUserOperationError,
  SmartAccountWithSignerRequiredError,
  deepHexlify,
  isSmartAccountWithSigner,
  isValidRequest,
  resolveProperties,
  type ClientMiddlewareFn,
  type UserOperationRequest_v6,
  type UserOperationRequest_v7,
} from "@alchemy/aa-core";
import { type Hex } from "viem";
import { isMultisigModularAccount } from "../../account/multisigAccount.js";
import {
  InvalidContextSignatureError,
  MultisigAccountExpectedError,
} from "../../errors.js";
import {
  combineSignatures,
  getSignerType,
  splitAggregatedSignature,
  type MultisigUserOperationContext,
} from "./index.js";

/**
 * A signer middleware to be used with Multisig Account Clients.
 * This middleware handles correctly aggregating signatures passed through
 * as context when sending UserOperations, proposing UserOperations, or adding signatures to a UserOperation.
 *
 * @param struct the user operation struct to be signed
 * @param param the parameters to be passed to the middleware
 * @param param.account the account to be used for signing
 * @param param.client the smart account client that will be used for RPC requests
 * @param param.context the context object containing the signatures to be aggregated {@link MultisigUserOperationContext}
 * @returns a Promise containing a UserOperation with an aggregated signature in the `signature` field
 */
export const multisigSignatureMiddleware: ClientMiddlewareFn<
  MultisigUserOperationContext
> = async (struct, { account, client, context }) => {
  // if the signature is not present, this has to be UPPERLIMIT because it's likely a propose operation
  if (
    !context ||
    (context.userOpSignatureType === "ACTUAL" &&
      !context.signatures &&
      !context.aggregatedSignature)
  ) {
    throw new InvalidContextSignatureError();
  }

  if (!isSmartAccountWithSigner(account)) {
    throw new SmartAccountWithSignerRequiredError();
  }

  if (!isMultisigModularAccount(account)) {
    throw new MultisigAccountExpectedError();
  }

  const resolvedStruct = await resolveProperties(struct);

  const request = deepHexlify(resolvedStruct);
  if (!isValidRequest(request)) {
    throw new InvalidUserOperationError(resolvedStruct);
  }

  const signature = await account.signUserOperationHash(
    account.getEntryPoint().getUserOperationHash(request)
  );

  const signerType = await getSignerType({
    client,
    signature: signature,
    signer: account.getSigner(),
  });

  // then this is a propose operation
  if (
    context.userOpSignatureType === "UPPERLIMIT" &&
    context?.signatures?.length == null &&
    context?.aggregatedSignature == null
  ) {
    return {
      ...resolvedStruct,
      signature: combineSignatures({
        signatures: [
          {
            signature,
            signer: await account.getSigner().getAddress(),
            signerType,
            userOpSigType: context.userOpSignatureType,
          },
        ],
        upperLimitMaxFeePerGas: request.maxFeePerGas,
        upperLimitMaxPriorityFeePerGas: request.maxPriorityFeePerGas,
        upperLimitPvg: request.preVerificationGas,
        usingMaxValues: false,
      }),
    };
  }

  if (context.aggregatedSignature == null || context.signatures == null) {
    throw new InvalidContextSignatureError();
  }

  // otherwise this is a sign operation
  const {
    upperLimitPvg,
    upperLimitMaxFeePerGas,
    upperLimitMaxPriorityFeePerGas,
  } = await splitAggregatedSignature({
    aggregatedSignature: context.aggregatedSignature,
    threshold: context.signatures.length + 1,
    account,
    request,
  });

  const finalSignature = combineSignatures({
    signatures: context.signatures.concat({
      userOpSigType: context.userOpSignatureType,
      signerType,
      signature,
      signer: await account.getSigner().getAddress(),
    }),
    upperLimitPvg,
    upperLimitMaxFeePerGas,
    upperLimitMaxPriorityFeePerGas,
    usingMaxValues: isUsingMaxValues(request, {
      upperLimitPvg,
      upperLimitMaxFeePerGas,
      upperLimitMaxPriorityFeePerGas,
    }),
  });

  return {
    ...resolvedStruct,
    signature: finalSignature,
  };
};

const isUsingMaxValues = (
  request: UserOperationRequest_v6 | UserOperationRequest_v7,
  upperLimits: {
    upperLimitPvg: Hex;
    upperLimitMaxFeePerGas: Hex;
    upperLimitMaxPriorityFeePerGas: Hex;
  }
): boolean => {
  if (
    BigInt(request.preVerificationGas) !== BigInt(upperLimits.upperLimitPvg)
  ) {
    return false;
  }

  if (
    BigInt(request.maxFeePerGas) !== BigInt(upperLimits.upperLimitMaxFeePerGas)
  ) {
    return false;
  }

  if (
    BigInt(request.maxPriorityFeePerGas) !==
    BigInt(upperLimits.upperLimitMaxPriorityFeePerGas)
  ) {
    return false;
  }

  return true;
};
