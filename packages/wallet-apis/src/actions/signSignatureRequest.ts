import { type Hex, hexToNumber, type Prettify, serializeSignature } from "viem";
import type {
  PersonalSignSignatureRequest,
  TypedDataSignatureRequest,
  AuthorizationSignatureRequest,
  Eip7702UnsignedAuth,
} from "@alchemy/wallet-api-types";
import { vToYParity } from "ox/Signature";
import type { InnerWalletApiClient, WithoutRawPayload } from "../types";
import { assertNever } from "@alchemy/common";

export type SignSignatureRequestParams = Prettify<
  WithoutRawPayload<
    | PersonalSignSignatureRequest
    | TypedDataSignatureRequest
    | (AuthorizationSignatureRequest & {
        data: Eip7702UnsignedAuth;
      })
  >
>;

export type SignSignatureRequestResult = Prettify<{
  type: "secp256k1";
  data: Hex;
}>;

/**
 * Signs a signature request using the provided signer.
 * This method handles different types of signature requests including personal_sign, eth_signTypedData_v4, and authorization.
 *
 * @param {SmartAccountSigner} signer - The signer to use for signing the request
 * @param {SignSignatureRequestParams} params - The signature request parameters
 * @param {string} params.type - The type of signature request ('personal_sign', 'eth_signTypedData_v4', or 'signature_with_authorization')
 * @param {SignSignatureRequestParams["data"]} params.data - The data to sign, format depends on the signature type
 * @returns {Promise<SignSignatureRequestResult>} A Promise that resolves to the signature result
 *
 * @example
 * ```ts
 * // Sign a personal message
 * const result = await client.signSignatureRequest({
 *   type: 'personal_sign',
 *   data: 'Hello, world!'
 * });
 *
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
  client: InnerWalletApiClient,
  params: SignSignatureRequestParams,
): Promise<SignSignatureRequestResult> {
  // TODO(jh): this is all messed up. is this really how we will access the signer?
  switch (params.type) {
    case "personal_sign": {
      return {
        type: "secp256k1",
        data: await client.account.signMessage(params.data),
      };
    }
    case "eth_signTypedData_v4": {
      return {
        type: "secp256k1",
        data: await client.account.signTypedData(params.data),
      };
    }
    case "eip7702Auth": {
      if (!client.account.signAuthorization) {
        throw new Error("Signer does not implement signAuthorization");
      }
      const { r, s, v, yParity } = await client.account.signAuthorization({
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
