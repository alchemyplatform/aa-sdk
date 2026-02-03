import type {
  PrepareCallsCapabilities,
  SendPreparedCallsCapabilities,
} from "./viemTypes.js";
import type { InnerWalletApiClient } from "../types.js";

/**
 * Merges client capabilities with capabilities from the request.
 * Uses policyId (singular) when there's one policy, policyIds (array) when multiple.
 *
 * @param {InnerWalletApiClient} client - The inner wallet API client (potentially including global capabilities like policy IDs)
 * @param {T | undefined} capabilities - Request capabilities to merge with, if any
 * @returns {T | undefined} The merged capabilities object, or original capabilities if no capability configuration exists on the client
 */
export const mergeClientCapabilities = <
  T extends PrepareCallsCapabilities | SendPreparedCallsCapabilities,
>(
  client: InnerWalletApiClient,
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

/**
 * Extracts capabilities from prepareCalls that are usable for sendPreparedCalls.
 * Only permissions and paymasterService (policyId/policyIds & webhookData) are supported.
 *
 * @param {PrepareCallsCapabilities | undefined} capabilities - The prepareCalls capabilities
 * @returns {SendPreparedCallsCapabilities | undefined} The sendPreparedCalls capabilities, or undefined if no relevant capabilities exist
 */
export const extractCapabilitiesForSending = (
  capabilities: PrepareCallsCapabilities | undefined,
): SendPreparedCallsCapabilities | undefined => {
  if (
    capabilities?.permissions == null &&
    capabilities?.paymasterService == null
  ) {
    return undefined;
  }

  const paymasterService = capabilities.paymasterService;

  return {
    permissions: capabilities.permissions,
    paymasterService:
      paymasterService != null
        ? {
            ...("policyId" in paymasterService
              ? { policyId: paymasterService.policyId }
              : { policyIds: paymasterService.policyIds }),
            webhookData: paymasterService.webhookData,
          }
        : undefined,
  };
};
