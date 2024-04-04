import {
  type SmartContractAccount,
  type UserOperationRequest,
  takeBytes,
} from "@alchemy/aa-core";
import { type Hex, hashMessage, recoverAddress, fromHex } from "viem";
import type { Signature } from "../types";
import { InvalidAggregatedSignatureError } from "../../../errors.js";

export type SplitAggregateSignatureParams = {
  aggregatedSignature: Hex;
  threshold: number;
  account: SmartContractAccount;
  request: UserOperationRequest;
};
/**
 * Takes an aggregated signature and threshold and splits it into its components
 *
 * @param aggregatedSignature - aggregated signature containing PVG || maxFeePerGas || maxPriorityFeePerGas || N-1 Signatures || [0, N-1] Contract Data
 * @param threshold - the account's required threshold of signatures
 */
export const splitAggregatedSignature = async ({
  aggregatedSignature,
  threshold,
  account,
  request,
}: SplitAggregateSignatureParams): Promise<{
  upperLimitPvg: Hex;
  upperLimitMaxFeePerGas: Hex;
  upperLimitMaxPriorityFeePerGas: Hex;
  signatures: Signature[];
}> => {
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
