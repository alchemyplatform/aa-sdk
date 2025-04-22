import { type SmartAccountSigner } from "@aa-sdk/core";
import { SmartAccountSignerFromClient } from "./smartAccountSigner.js";
import {
  AlchemyApiKeySignerClient,
  type AlchemyApiKeySignerClientParams,
} from "./client/apiKey.js";

interface CreateApiKeySignerParams extends AlchemyApiKeySignerClientParams {
  userOrgId: string;
}

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
 *   userOrgId: 'user-org-id',
 * });
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
 * @param {CreateApiKeySignerParams} params Parameters including the connection config, api key, and user org ID
 * @returns {Promise<SmartAccountSigner>} A promise that resolves to a SmartAccountSigner
 * @throws {Error} If the API key is invalid for the given orgId
 */
export const createApiKeySigner = async (
  params: CreateApiKeySignerParams
): Promise<SmartAccountSigner> => {
  const { userOrgId, ...clientParams } = params;
  const client = new AlchemyApiKeySignerClient(clientParams);
  // Basically "logs the user in," since calling `whoami` only works if the API
  // key is valid for the given orgId, and sets the active user on the client.
  await client.whoami(userOrgId);
  return new SmartAccountSignerFromClient(client, "alchemy-api-key-signer");
};
