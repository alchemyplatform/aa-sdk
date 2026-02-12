import { type Hex, type Prettify, concatHex } from "viem";
import type { DistributiveOmit, InnerWalletApiClient } from "../types.ts";
import { wallet_createSession as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import { signSignatureRequest } from "./signSignatureRequest.js";
import { LOGGER } from "../logger.js";
import type { StaticDecode } from "typebox";
import { Value } from "typebox/value";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";

const schema = {
  request: MethodSchema.properties.Request.properties.params.items[0],
  response: MethodSchema.properties.ReturnType,
};

// Runtime types.
type Schema = StaticDecode<typeof MethodSchema>;
type BaseCreateSessionParams = Schema["Request"]["params"][0];

export type GrantPermissionsParams = Prettify<
  DistributiveOmit<BaseCreateSessionParams, "account" | "chainId"> & {
    account?: AccountParam;
    chainId?: number;
  }
>;

export type GrantPermissionsResult = Prettify<{
  context: Hex;
}>;

/**
 * Grants permissions to a smart account by creating a session.
 * This allows another key to perform operations on behalf of the account.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {GrantPermissionsParams} params - The parameters for granting permissions
 * @param {AccountParam} [params.account] - The account (required if client was not initialized with an account). Can be an address string or an object with an `address` property.
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
 *   calls: [{ to: zeroAddress, value: 0n }],
 *   from: account.address,
 *   capabilities: {
 *     paymaster: {
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
  const account = params.account
    ? resolveAddress(params.account)
    : client.account.address;

  LOGGER.debug("grantPermissions:start", { expirySec: params.expirySec });

  const chainId = params.chainId ?? client.chain.id;

  const { account: _, chainId: __, ...rest } = params;
  const rpcParams = Value.Encode(schema.request, {
    ...rest,
    account,
    chainId,
  } satisfies BaseCreateSessionParams);

  const rpcResp = await client.request({
    method: "wallet_createSession",
    params: [rpcParams],
  });

  const { sessionId, signatureRequest } = Value.Decode(
    schema.response,
    rpcResp,
  ) satisfies {
    sessionId: Hex;
    signatureRequest: Parameters<typeof signSignatureRequest>[1];
  };

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
