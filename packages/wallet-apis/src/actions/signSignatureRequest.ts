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
import { getAction } from "viem/utils";
import { signAuthorization, signMessage, signTypedData } from "viem/actions";
import { LOGGER } from "../logger.js";

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
  LOGGER.debug("signSignatureRequest:start", { type: params.type });
  const actions = {
    signMessage: getAction(client.owner, signMessage, "signMessage"),
    signTypedData: getAction(client.owner, signTypedData, "signTypedData"),
    signAuthorization: getAction(
      client.owner,
      signAuthorization,
      "signAuthorization",
    ),
  };

  switch (params.type) {
    case "personal_sign": {
      const res = {
        type: "secp256k1",
        data: await actions.signMessage({
          message: params.data,
          account: client.owner.account,
        }),
      } as const;
      LOGGER.debug("signSignatureRequest:personal_sign:ok");
      return res;
    }
    case "eth_signTypedData_v4": {
      const res = {
        type: "secp256k1",
        data: await actions.signTypedData({
          ...params.data,
          account: client.owner.account,
        }),
      } as const;
      LOGGER.debug("signSignatureRequest:typedData:ok");
      return res;
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
        account: client.owner.account,
      });
      // yParity *should* already be a number, but some 3rd
      // party signers may mistakenly return it as a bigint.
      const yParity =
        _yParity != null ? Number(_yParity) : vToYParity(Number(v));

      const res = {
        type: "secp256k1",
        data: serializeSignature({
          r,
          s,
          yParity,
        }),
      } as const;
      LOGGER.debug("signSignatureRequest:eip7702Auth:ok");
      return res;
    }
    default:
      LOGGER.warn("signSignatureRequest:unknown-type", {
        type: params.type,
      });
      return assertNever(params, `Unexpected signature request type.`);
  }
}
