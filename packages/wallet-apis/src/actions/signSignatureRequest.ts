import { type Hex, hexToNumber, type Prettify, serializeSignature } from "viem";
import type {
  PersonalSignSignatureRequest,
  TypedDataSignatureRequest,
  AuthorizationSignatureRequest,
  Eip7702UnsignedAuth,
} from "@alchemy/wallet-api-types";
import { vToYParity } from "ox/Signature";
import type {
  InnerWalletApiClient,
  SignerClient,
  WithoutRawPayload,
} from "../types";
import { assertNever, BaseError } from "@alchemy/common";
import { LOGGER } from "../logger.js";
import { isLocalAccount, isWebAuthnAccount } from "../utils/assertions.js";
import { getAction } from "viem/utils";
import { signAuthorization, signMessage, signTypedData } from "viem/actions";
import type {
  WebAuthnSignReturnType,
  WebAuthnAccount,
} from "viem/account-abstraction";
import type { LocalAccount } from "viem";

export type SignSignatureRequestParams = Prettify<
  WithoutRawPayload<
    | PersonalSignSignatureRequest
    | TypedDataSignatureRequest
    | (AuthorizationSignatureRequest & {
        data: Eip7702UnsignedAuth;
      })
  >
>;

export type SignSignatureRequestResult =
  | {
      type: "secp256k1";
      data: Hex;
    }
  | {
      type: "webauthn-p256";
      data: {
        signature: Hex;
        metadata: Pick<
          WebAuthnSignReturnType["webauthn"],
          "clientDataJSON" | "authenticatorData"
        >;
      };
    };

/**
 * Signs a signature request using the provided signer.
 * This method handles different types of signature requests including personal_sign, eth_signTypedData_v4, and authorization.
 *
 * @param {InnerWalletApiClient} client - The wallet client to use for signing
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

  if (isWebAuthnAccount(client.owner)) {
    return signWithWebAuthn(client.owner, params);
  }

  if (isLocalAccount(client.owner)) {
    return signWithLocalAccount(client.owner, params);
  }

  return signWithSignerClient(client.owner, params);
}

// ─────────────────────────────────────────────────────────────────────────────
// WebAuthn signer
// ─────────────────────────────────────────────────────────────────────────────

type WebAuthnResult = Extract<
  SignSignatureRequestResult,
  { type: "webauthn-p256" }
>;

async function signWithWebAuthn(
  signer: WebAuthnAccount,
  params: SignSignatureRequestParams,
): Promise<WebAuthnResult> {
  switch (params.type) {
    case "personal_sign": {
      const { signature, webauthn: metadata } = await signer.signMessage({
        message: params.data,
      });
      LOGGER.debug("signSignatureRequest:webauthn:personal_sign:ok");
      return { type: "webauthn-p256", data: { signature, metadata } };
    }
    case "eth_signTypedData_v4": {
      const { signature, webauthn: metadata } = await signer.signTypedData(
        params.data,
      );
      LOGGER.debug("signSignatureRequest:webauthn:eth_signTypedData_v4:ok");
      return { type: "webauthn-p256", data: { signature, metadata } };
    }
    case "eip7702Auth":
      throw new BaseError(
        "WebAuthn account cannot sign EIP-7702 authorization requests",
      );
    default:
      LOGGER.warn("signSignatureRequest:unknown-type", {
        type: (params as { type?: unknown }).type,
      });
      return assertNever(params, "Unexpected signature request type.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LocalAccount signer
// ─────────────────────────────────────────────────────────────────────────────

type Secp256k1Result = Extract<
  SignSignatureRequestResult,
  { type: "secp256k1" }
>;

async function signWithLocalAccount(
  signer: LocalAccount,
  params: SignSignatureRequestParams,
): Promise<Secp256k1Result> {
  switch (params.type) {
    case "personal_sign": {
      const data = await signer.signMessage({ message: params.data });
      LOGGER.debug("signSignatureRequest:localAccount:personal_sign:ok");
      return { type: "secp256k1", data };
    }
    case "eth_signTypedData_v4": {
      const data = await signer.signTypedData(params.data);
      LOGGER.debug("signSignatureRequest:localAccount:eth_signTypedData_v4:ok");
      return { type: "secp256k1", data };
    }
    case "eip7702Auth": {
      if (!signer.signAuthorization) {
        throw new BaseError(
          "Current signer does not support signing authorization requests",
        );
      }
      const {
        r,
        s,
        v,
        yParity: _yParity,
      } = await signer.signAuthorization({
        address: params.data.address,
        chainId: hexToNumber(params.data.chainId),
        nonce: hexToNumber(params.data.nonce),
      });
      const yParity =
        _yParity != null ? Number(_yParity) : vToYParity(Number(v));
      LOGGER.debug("signSignatureRequest:localAccount:eip7702Auth:ok");
      return {
        type: "secp256k1",
        data: serializeSignature({ r, s, yParity }),
      };
    }
    default:
      LOGGER.warn("signSignatureRequest:unknown-type", {
        type: (params as { type?: unknown }).type,
      });
      return assertNever(params, "Unexpected signature request type.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SignerClient (WalletClient)
// ─────────────────────────────────────────────────────────────────────────────

async function signWithSignerClient(
  signer: SignerClient,
  params: SignSignatureRequestParams,
): Promise<Secp256k1Result> {
  switch (params.type) {
    case "personal_sign": {
      const action = getAction(signer, signMessage, "signMessage");
      const data = await action({
        message: params.data,
        account: signer.account,
      });
      LOGGER.debug("signSignatureRequest:signerClient:personal_sign:ok");
      return { type: "secp256k1", data };
    }
    case "eth_signTypedData_v4": {
      const action = getAction(signer, signTypedData, "signTypedData");
      const data = await action({ ...params.data, account: signer.account });
      LOGGER.debug("signSignatureRequest:signerClient:eth_signTypedData_v4:ok");
      return { type: "secp256k1", data };
    }
    case "eip7702Auth": {
      const action = getAction(signer, signAuthorization, "signAuthorization");
      const {
        r,
        s,
        v,
        yParity: _yParity,
      } = await action({
        address: params.data.address,
        chainId: hexToNumber(params.data.chainId),
        nonce: hexToNumber(params.data.nonce),
        account: signer.account,
      });
      const yParity =
        _yParity != null ? Number(_yParity) : vToYParity(Number(v));
      LOGGER.debug("signSignatureRequest:signerClient:eip7702Auth:ok");
      return {
        type: "secp256k1",
        data: serializeSignature({ r, s, yParity }),
      };
    }
    default:
      LOGGER.warn("signSignatureRequest:unknown-type", {
        type: (params as { type?: unknown }).type,
      });
      return assertNever(params, "Unexpected signature request type.");
  }
}
