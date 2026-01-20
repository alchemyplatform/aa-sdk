import type {
  Capabilities,
  PermissionsCapability,
} from "@alchemy/wallet-api-types/capabilities";
import type { InnerWalletApiClientBase } from "../types.js";

// TODO(jh): this should be imported from wallet-api-types.
type RpcSendPreparedCallsCapabilities = {
  permissions?: PermissionsCapability;
  paymasterService?: {
    policyId: string;
    webhookData?: string;
  };
};

/**
 * Merges client capabilities with capabilities from the request.
 * Uses policyId (singular) when there's one policy, policyIds (array) when multiple.
 *
 * @param {InnerWalletApiClientBase} client - The inner wallet API client (potentially including global capabilities like policy IDs)
 * @param {T | undefined} capabilities - Request capabilities to merge with, if any
 * @returns {T | undefined} The merged capabilities object, or original capabilities if no capability configuration exists on the client
 */
export const mergeClientCapabilities = <
  T extends Capabilities | RpcSendPreparedCallsCapabilities,
>(
  client: InnerWalletApiClientBase,
  capabilities: T | undefined,
): T | undefined => {
  if (!client.policyIds?.length || capabilities?.paymasterService) {
    return capabilities;
  }

  return {
    ...capabilities,
    paymasterService:
      client.policyIds.length === 1
        ? { policyId: client.policyIds[0] }
        : { policyIds: client.policyIds },
  } as T;
};
