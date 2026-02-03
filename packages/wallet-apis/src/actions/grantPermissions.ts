import { type Hex, type Prettify, concatHex } from "viem";
import type { InnerWalletApiClient } from "../types.ts";
import { signSignatureRequest } from "./signSignatureRequest.js";
import { AccountNotFoundError } from "@alchemy/common";
import { LOGGER } from "../logger.js";
import type { GrantPermissionsParams as ViemGrantPermissionsParams } from "../utils/viemTypes.js";
import { toRpcGrantPermissionsParams } from "../utils/viemDecode.js";

export type GrantPermissionsParams = Prettify<ViemGrantPermissionsParams>;

export type GrantPermissionsResult = Prettify<{
  context: Hex;
}>;

/**
 * Grants permissions to a smart account by creating a session.
 * This allows another key to perform operations on behalf of the account.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {GrantPermissionsParams} params - The parameters for granting permissions
 * @param {Address} [params.account] - The account address (required if client was not initialized with an account)
 * @param {number} params.expirySec - Unix timestamp when the permissions expire
 * @param {sessionKeyData} params.key - The session key information
 * @param {string} params.key.publicKey - The public key of the session key
 * @param {string} params.key.type - The type of the key (e.g., "secp256k1")
 * @param {Array} params.permissions - Array of permission objects defining what the session key can do
 * @returns {Promise<GrantPermissionsResult>} A Promise that resolves to the result containing a context identifier
 *
 * @example
 * ```ts
 * // Create a session key and grant root permissions
 * const sessionKey = LocalAccountSigner.generatePrivateKeySigner();
 * const account = await client.requestAccount();
 *
 * const permissions = await client.grantPermissions({
 *   account: account.address,
 *   expirySec: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
 *   key: {
 *     publicKey: await sessionKey.getAddress(),
 *     type: "secp256k1",
 *   },
 *   permissions: [{ type: "root" }],
 * });
 *
 * // Use the permissions to prepare a call
 * const preparedCalls = await client.prepareCalls({
 *   calls: [{ to: zeroAddress, value: "0x0" }],
 *   from: account.address,
 *   capabilities: {
 *     paymasterService: {
 *       policyId: "your-paymaster-policy-id",
 *     },
 *     permissions,
 *   },
 * });
 *
 * // Sign with the session key
 * const signedCalls = await signPreparedCalls(sessionKey, preparedCalls);
 *
 * // Send the prepared call using the session key
 * const result = await client.sendPreparedCalls({
 *   ...signedCalls,
 *   capabilities: {
 *     permissions,
 *   },
 * });
 * ```
 */
export async function grantPermissions(
  client: InnerWalletApiClient,
  params: GrantPermissionsParams,
): Promise<GrantPermissionsResult> {
  const account = params.account ?? client.account?.address;
  if (!account) {
    LOGGER.warn("grantPermissions:no-account");
    throw new AccountNotFoundError();
  }
  LOGGER.debug("grantPermissions:start", { expirySec: params.expirySec });

  // Convert viem-native params to RPC format
  const rpcParams = toRpcGrantPermissionsParams(
    params,
    client.chain.id,
    account,
  );

  // Cast to satisfy RPC schema - our RpcPermission types are compatible with the API
  const response = await client.request({
    method: "wallet_createSession",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: [rpcParams as any],
  });

  const { sessionId, signatureRequest } = response;

  const signature = await signSignatureRequest(client, signatureRequest);

  const res = {
    context: concatHex([
      "0x00", // Remote mode.
      sessionId,
      signature.data,
    ]),
  } as const;
  LOGGER.debug("grantPermissions:done");
  return res;
}
