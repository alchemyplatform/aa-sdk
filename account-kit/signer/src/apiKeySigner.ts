import { type SmartAccountSigner } from "@aa-sdk/core";
import { SmartAccountSignerFromClient } from "./smartAccountSigner.js";
import {
  AlchemyApiKeySignerClient,
  type AlchemyApiKeySignerClientParams,
} from "./client/apiKey.js";

/**
 * Creates a SmartAccountSigner using an AlchemyApiKeySignerClient.
 *
 * @example
 * ```ts
 *  const signer = await createApiKeySigner({
 *   apiKey: {
 *     privateKey: "private-api-key",
 *     publicKey: "public-api-key",
 *   },
 *   connection: {
 *     apiKey: "alchemy-api-key",
 *   },
 * }, "user-org-id");
 *
 * const account = await createModularAccountV2({
 *   transport,
 *   signer,
 *   chain,
 * });
 *
 * const client = createAlchemySmartAccountClient({
 *   account,
 *   transport,
 *   chain,
 * });
 * ```
 *
 * @param {AlchemyApiKeySignerClientParams} clientParams The parameters for the AlchemyApiKeySignerClient
 * @param {string} userOrgId The organization ID of the user
 * @returns {Promise<SmartAccountSigner>} A promise that resolves to a SmartAccountSigner
 * @throws {Error} If the API key is invalid for the given orgId
 */
export const createApiKeySigner = async (
  clientParams: AlchemyApiKeySignerClientParams,
  userOrgId: string,
): Promise<SmartAccountSigner> => {
  const client = new AlchemyApiKeySignerClient(clientParams);
  // Basically "logs the user in," since calling `whoami` only works if the API
  // key is valid for the given orgId, and sets the active user on the client.
  await client.whoami(userOrgId);
  return new SmartAccountSignerFromClient(client, "alchemy-api-key-signer");
};
