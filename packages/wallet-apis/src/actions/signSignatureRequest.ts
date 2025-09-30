import { type Hex, hexToNumber, type Prettify, serializeSignature } from "viem";
import type {
  PersonalSignSignatureRequest,
  TypedDataSignatureRequest,
  AuthorizationSignatureRequest,
  Eip7702UnsignedAuth,
} from "@alchemy/wallet-api-types";
import { vToYParity } from "ox/Signature";
import type { SignerClient, WithoutRawPayload } from "../types";
import { assertNever } from "@alchemy/common";
import { getAction } from "viem/utils";
import { signAuthorization, signMessage, signTypedData } from "viem/actions";

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
  signerClient: SignerClient,
  params: SignSignatureRequestParams,
): Promise<SignSignatureRequestResult> {
  const actions = {
    signMessage: getAction(signerClient, signMessage, "signMessage"),
    signTypedData: getAction(signerClient, signTypedData, "signTypedData"),
    signAuthorization: getAction(
      signerClient,
      signAuthorization,
      "signAuthorization",
    ),
  };

  switch (params.type) {
    case "personal_sign": {
      return {
        type: "secp256k1",
        data: await actions.signMessage({
          message: params.data,
          account: signerClient.account,
        }),
      };
    }
    case "eth_signTypedData_v4": {
      return {
        type: "secp256k1",
        data: await actions.signTypedData({
          ...params.data,
          account: signerClient.account,
        }),
      };
    }
    case "eip7702Auth": {
      const {
        r,
        s,
        v,
        yParity: _yParity,
      } = await actions.signAuthorization({
        ...{
          ...params.data,
          chainId: hexToNumber(params.data.chainId),
          nonce: hexToNumber(params.data.nonce),
        },
        account: signerClient.account,
      });
      // yParity *should* already be a number, but some 3rd
      // party signers may mistakenly return it as a bigint.
      const yParity =
        _yParity != null ? Number(_yParity) : vToYParity(Number(v));

      return {
        type: "secp256k1",
        data: serializeSignature({
          r,
          s,
          yParity,
        }),
      };
    }
    default:
      return assertNever(params, `Unexpected signature request type.`);
  }
}
