import { AccountNotFoundError, type SmartAccountSigner } from "@aa-sdk/core";
import type { Address, Hex, IsUndefined, Prettify } from "viem";
import { toHex, concatHex } from "viem";
import type { InnerWalletApiClient } from "../../types.ts";
import type { Static } from "@sinclair/typebox";
import type { wallet_createSession } from "@alchemy/wallet-api-types/rpc";
// import { encodePermissionsContext } from "@alchemy/wallet-api-types/capabilities";
import { signSignatureRequest } from "./signSignatureRequest.js";
import { metrics } from "../../metrics.js";
import { assertNever } from "../../utils.js";
import type { DecodedPermissionsContext } from "@alchemy/wallet-api-types/capabilities";

// TODO(jh): can this live somewhere that doesn't import a non-type from types pkg?
const PermissionsContextVersion = {
  REMOTE_MODE_DEFERRED_ACTION: "0x00",
  LOCAL_MODE_DEFERRED_ACTION: "0x01",
  NON_DEFERRED_ACTION: "0x02",
} as const;

// TODO(jh): can this live somewhere that doesn't import a non-type from types pkg?
const encodePermissionsContext = (context: DecodedPermissionsContext): Hex => {
  switch (context.contextVersion) {
    case "REMOTE_MODE_DEFERRED_ACTION":
      return concatHex([
        PermissionsContextVersion.REMOTE_MODE_DEFERRED_ACTION,
        context.sessionId,
        context.signature,
      ]);
    case "LOCAL_MODE_DEFERRED_ACTION":
      return concatHex([
        PermissionsContextVersion.LOCAL_MODE_DEFERRED_ACTION,
        context.deferredAction,
      ]);
    case "NON_DEFERRED_ACTION":
      return concatHex([
        PermissionsContextVersion.NON_DEFERRED_ACTION,
        context.isGlobalValidation ? "0x01" : "0x00",
        context.entityId,
      ]);
    default:
      return assertNever(context, "Unexpected context version");
  }
};

export type GrantPermissionsParams<
  TAccount extends Address | undefined = Address | undefined,
> = Prettify<
  Omit<
    Static<
      (typeof wallet_createSession)["properties"]["Request"]["properties"]["params"]
    >[0],
    "account" | "chainId"
  > &
    (IsUndefined<TAccount> extends true
      ? { account: Address }
      : { account?: never })
>;

export type GrantPermissionsResult = {
  context: Hex;
};

/**
 * Grants permissions to a smart account by creating a session.
 * This allows another key to perform operations on behalf of the account.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SmartAccountSigner} signer - The signer of the smart account
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
export async function grantPermissions<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: InnerWalletApiClient,
  signer: SmartAccountSigner,
  params: GrantPermissionsParams<TAccount>
): Promise<GrantPermissionsResult> {
  metrics.trackEvent({
    name: "grant_permissions",
  });

  const account = params.account ?? client.account?.address;
  if (!account) {
    throw new AccountNotFoundError();
  }

  const { sessionId, signatureRequest } = await client.request({
    method: "wallet_createSession",
    params: [
      {
        ...params,
        account,
        chainId: toHex(client.chain.id),
      },
    ],
  });

  const signature = await signSignatureRequest(signer, signatureRequest);

  return {
    context: encodePermissionsContext({
      contextVersion: "REMOTE_MODE_DEFERRED_ACTION",
      sessionId,
      signature: signature.data,
    }),
  };
}
