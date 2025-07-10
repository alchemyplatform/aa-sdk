import type { SmartAccountSigner } from "@aa-sdk/core";
import { type Hex, hexToNumber, serializeSignature } from "viem";
import { assertNever } from "../../utils.js";
import {
  type PersonalSignSignatureRequest,
  type TypedDataSignatureRequest,
  type AuthorizationSignatureRequest,
  type Eip7702UnsignedAuth,
} from "@alchemy/wallet-api-types";
import { vToYParity } from "ox/Signature";
import type { WithoutRawPayload } from "../../types.ts";

export type SignSignatureRequestParams = WithoutRawPayload<
  | PersonalSignSignatureRequest
  | TypedDataSignatureRequest
  | (AuthorizationSignatureRequest & {
      data: Eip7702UnsignedAuth;
    })
>;

export type SignSignatureRequestResult = {
  type: "secp256k1";
  data: Hex;
};

/**
 * Signs a signature request using the provided signer.
 * This method handles different types of signature requests including personal_sign, eth_signTypedData_v4, and authorization.
 *
 * @param {SmartAccountSigner} signer - The signer to use for signing the request
 * @param {SignSignatureRequestParams} params - The signature request parameters
 * @param {string} params.type - The type of signature request ('personal_sign', 'eth_signTypedData_v4', or 'signature_with_authorization')
 * @param {any} params.data - The data to sign, format depends on the signature type
 * @returns {Promise<SignSignatureRequestResult>} A Promise that resolves to the signature result
 * @returns {string} result.type - The signature type (currently only 'secp256k1' is supported)
 * @returns {Hex} result.signature - The hex-encoded signature
 * @returns {Eip7702ExtendedFields["eip7702Auth"]} result.signedAuthorization - The signed EIP-7702 authorization, if applicable
 *
 * @example
 * ```ts
 * // Sign a personal message
 * const result = await client.signSignatureRequest({
 *   type: 'personal_sign',
 *   data: 'Hello, world!'
 * });
 * ```
 *
 * @example
 * ```ts
 * // Sign typed data (EIP-712)
 * const result = await client.signSignatureRequest({
 *   type: 'eth_signTypedData_v4',
 *   data: {
 *     domain: { ... },
 *     types: { ... },
 *     primaryType: '...',
 *     message: { ... }
 *   }
 * });
 * ```
 */

export async function signSignatureRequest(
  signer: SmartAccountSigner,
  params: SignSignatureRequestParams,
): Promise<SignSignatureRequestResult> {
  switch (params.type) {
    case "personal_sign": {
      return {
        type: "secp256k1",
        data: await signer.signMessage(params.data),
      };
    }
    case "eth_signTypedData_v4": {
      return {
        type: "secp256k1",
        data: await signer.signTypedData(params.data),
      };
    }
    case "eip7702Auth": {
      if (!signer.signAuthorization) {
        throw new Error("Signer does not implement signAuthorization");
      }
      const { r, s, v, yParity } = await signer.signAuthorization({
        ...params.data,
        chainId: hexToNumber(params.data.chainId),
        nonce: hexToNumber(params.data.nonce),
      });

      return {
        type: "secp256k1",
        data: serializeSignature({
          r,
          s,
          yParity: yParity ?? vToYParity(Number(v)),
        }),
      };
    }
    default:
      return assertNever(params, `Unexpected signature request type.`);
  }
}
