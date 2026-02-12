import { type Hex, type Prettify, type SignableMessage } from "viem";
import type { InnerWalletApiClient } from "../types.js";
import { prepareSign } from "./prepareSign.js";
import { signSignatureRequest } from "./signSignatureRequest.js";
import { formatSign } from "./formatSign.js";
import { signableMessageToJsonSafe } from "../utils/format.js";
import { LOGGER } from "../logger.js";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";

export type SignMessageParams = Prettify<{
  message: SignableMessage;
  account?: AccountParam;
}>;

export type SignMessageResult = Prettify<Hex>;

/**
 * Signs a message using the smart account.
 * This method requests the account associated with the signer and uses it to sign the message.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SignMessageParams} params - Parameters for signing the message
 * @param {SignableMessage} params.message - The message to sign using EIP-191. Can be a string, or object with raw bytes.
 * @param {Address} [params.account] - Optional account address to use for signing. If not provided, uses the client's current account.
 * @returns {Promise<SignMessageResult>} A Promise that resolves to the signed message as a hex string
 *
 * @example
 * ```ts
 * // Sign a simple text message
 * const signature = await client.signMessage("Hello, world!");
 *
 * // Sign a raw hex message
 * const signature = await client.signMessage({ raw: "0x48656c6c6f2c20776f726c6421" });
 * ```
 */
export async function signMessage(
  client: InnerWalletApiClient,
  params: SignMessageParams,
): Promise<SignMessageResult> {
  const accountAddress = params.account
    ? resolveAddress(params.account)
    : client.account.address;
  LOGGER.debug("signMessage:start", {
    hasExplicitAccount: params.account != null,
  });

  const prepared = await prepareSign(client, {
    account: accountAddress,
    signatureRequest: {
      type: "personal_sign",
      data: signableMessageToJsonSafe(params.message),
    },
  });

  const signed = await signSignatureRequest(client, prepared.signatureRequest);

  const formatted = await formatSign(client, {
    account: accountAddress,
    signature: {
      type: "ecdsa",
      data: signed.data,
    },
  });
  LOGGER.debug("signMessage:done", { from: accountAddress });
  return formatted.signature;
}
