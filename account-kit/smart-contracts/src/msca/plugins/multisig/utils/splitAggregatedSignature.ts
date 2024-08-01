import {
  takeBytes,
  type GetEntryPointFromAccount,
  type SmartContractAccount,
  type UserOperationRequest,
} from "@aa-sdk/core";
import { fromHex, hashMessage, recoverAddress, type Hex } from "viem";
import { InvalidAggregatedSignatureError } from "../../../errors.js";
import type { Signature } from "../types.js";

export type SplitAggregateSignatureParams<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  aggregatedSignature: Hex;
  threshold: number;
  account: SmartContractAccount;
  request: UserOperationRequest<TEntryPointVersion>;
};

export type SplitAggregateSignatureResult = {
  upperLimitPvg: Hex;
  upperLimitMaxFeePerGas: Hex;
  upperLimitMaxPriorityFeePerGas: Hex;
  signatures: Signature[];
};

/**
 * Takes an aggregated signature and threshold and splits it into its components
 *
 * @param {SplitAggregateSignatureParams<TAccount>} args - the arguments for the split
 * @param {Hex} args.aggregateSignature - the aggregated signature to split
 * @param {number} args.threshold - the threshold for the signature
 * @param {SmartContractAccount} args.account - the account which the signature is valid for
 * @param {UserOperationRequest<TEntryPointVersion>} args.request - the user operation request that the signature is for
 * @returns {Promise<SplitAggregateSignatureResult>} the signature split into its upper limits and current signatures
 */
export const splitAggregatedSignature = async <
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  args: SplitAggregateSignatureParams<TAccount>
): Promise<SplitAggregateSignatureResult> => {
  const { aggregatedSignature, threshold, account, request } = args;
  if (aggregatedSignature.length < 192 + (65 * threshold - 1)) {
    throw new InvalidAggregatedSignatureError();
  }

  // UserOp.sig format:
  // 0-32: upperLimitPreVerificationGas
  // 32-64: upperLimitMaxFeePerGas
  // 64-96: upperLimitMaxPriorityFeePerGas
  // 96-96+n: k signatures, each sig is 65 bytes each (so n = 65 * k)
  // 96+n-: contract signatures if any
  const pvg = takeBytes(aggregatedSignature, { count: 32 });
  const maxFeePerGas = takeBytes(aggregatedSignature, {
    count: 32,
    offset: 32,
  });
  const maxPriorityFeePerGas = takeBytes(aggregatedSignature, {
    count: 32,
    offset: 64,
  });
  const signaturesAndData = takeBytes(aggregatedSignature, {
    offset: 96,
  });

  const signatureHexes = (() => {
    const signatureStr = takeBytes(signaturesAndData, {
      count: 65 * threshold - 1,
    });
    const signatures: Hex[] = [];
    for (let i = 0; i < threshold - 1; i++) {
      signatures.push(takeBytes(signatureStr, { count: 65, offset: i * 65 }));
    }

    return signatures;
  })();

  const signatures: Promise<Signature>[] = signatureHexes.map(
    async (signature): Promise<Signature> => {
      // in RSV, v is the last byte of a 65 byte signature
      const v = BigInt(takeBytes(signature, { count: 1, offset: 64 }));
      const signerType = v === 0n ? "CONTRACT" : "EOA";
      if (signerType === "EOA") {
        // To recover the signer from just the user op and the raw EOA signature, we need to perform an EC recover. The input hash to recover from should be the original user op hash, with the upper limit gas values, wrapped in the standard EIP-191 wrapper format.
        const hash = hashMessage({
          raw: account.getEntryPoint().getUserOperationHash({
            ...request,
            preVerificationGas: pvg,
            maxFeePerGas,
            maxPriorityFeePerGas,
          }),
        });

        return {
          // the signer doesn't get used here for EOAs
          // TODO: nope. this needs to actually do an ec recover
          signer: await recoverAddress({ hash, signature }),
          signature,
          signerType,
          userOpSigType: "UPPERLIMIT",
        };
      }

      const signer = takeBytes(signature, { count: 20, offset: 12 });
      const offset = fromHex(
        takeBytes(signature, { count: 32, offset: 32 }),
        "number"
      );
      const signatureLength = fromHex(
        takeBytes(signaturesAndData, { count: 32, offset }),
        "number"
      );

      return {
        signer,
        signerType,
        userOpSigType: "UPPERLIMIT",
        signature: takeBytes(signaturesAndData, {
          count: signatureLength,
          offset: offset + 32,
        }),
      };
    }
  );

  return {
    upperLimitPvg: pvg,
    upperLimitMaxFeePerGas: maxFeePerGas,
    upperLimitMaxPriorityFeePerGas: maxPriorityFeePerGas,
    signatures: await Promise.all(signatures),
  };
};
