import {
  InvalidUserOperationError,
  SmartAccountWithSignerRequiredError,
  deepHexlify,
  isSmartAccountWithSigner,
  isValidRequest,
  resolveProperties,
  type ClientMiddlewareFn,
} from "@alchemy/aa-core";
import { isHex, type Hex } from "viem";
import { isMultisigModularAccount } from "../../account/multisigAccount.js";
import { getThreshold } from "./actions/getThreshold.js";
import { UserOpSignatureType } from "./types.js";
import {
  combineSignatures,
  getSignerType,
  splitAggregatedSignature,
} from "./utils.js";

export const multisigSignatureMiddleware: ClientMiddlewareFn<{
  signature: Hex;
}> = async (struct, { account, client, context }) => {
  if (!isSmartAccountWithSigner(account)) {
    throw new SmartAccountWithSignerRequiredError();
  }

  if (!isMultisigModularAccount(account)) {
    // TODO: use error classes
    throw new Error("Expected account to be a multisig modular account");
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

  // TODO: this needs to actually check the account's installed plugins and fetch the multisig plugin address
  const threshold = await getThreshold(client, { account });

  // if there is no override, then return the dummy signature
  if (context?.signature == null) {
    return {
      ...resolvedStruct,
      signature: account.getDummySignature(),
    };
  }

  if (!isHex(context.signature)) {
    // TODO: use error classes
    throw new Error("Expected context.signature to be a hex string");
  }

  const {
    upperLimitPvg,
    upperLimitMaxFeePerGas,
    upperLimitMaxPriorityFeePerGas,
    signatures,
  } = await splitAggregatedSignature({
    aggregatedSignature: context.signature,
    threshold: Number(threshold),
    account,
    request,
  });

  const finalSignature = combineSignatures({
    signatures: signatures.concat({
      userOpSigType: UserOpSignatureType.Actual,
      signerType,
      signature,
      signer: await account.getSigner().getAddress(),
    }),
    upperLimitPvg,
    upperLimitMaxFeePerGas,
    upperLimitMaxPriorityFeePerGas,
  });

  return {
    ...resolvedStruct,
    signature: finalSignature,
  };
};
