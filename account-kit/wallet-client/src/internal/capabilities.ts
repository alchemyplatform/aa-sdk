import type {
  PrepareCallsCapabilities,
  SendPreparedCallsCapabilities,
} from "@alchemy/wallet-api-types/capabilities";

import type { InnerWalletApiClientBase } from "../types.js";

export type MergeClientCapabilitiesOptions = {
  /** If true, always use policyId (singular) even when client has multiple policyIds. Takes the first one. */
  useSinglePolicyId?: boolean;
};

/**
 * Merges client capabilities with capabilities from the request.
 * Uses policyId (singular) when there's one policy, policyIds (array) when multiple (unless useSinglePolicyId is true).
 *
 * @param {InnerWalletApiClientBase} client - The inner wallet API client (potentially including global capabilities like policy IDs)
 * @param {T | undefined} capabilities - Request capabilities to merge with, if any
 * @param {MergeClientCapabilitiesOptions} options - Options for merging
 * @returns {T | undefined} The merged capabilities object, or original capabilities if no capability configuration exists on the client
 */
export const mergeClientCapabilities = <
  T extends PrepareCallsCapabilities | SendPreparedCallsCapabilities,
>(
  client: InnerWalletApiClientBase,
  capabilities: T | undefined,
  options?: MergeClientCapabilitiesOptions,
): T | undefined => {
  if (!client.policyIds?.length || capabilities?.paymasterService) {
    return capabilities;
  }

  const useSinglePolicyId = options?.useSinglePolicyId ?? false;

  return {
    ...capabilities,
    paymasterService:
      useSinglePolicyId || client.policyIds.length === 1
        ? { policyId: client.policyIds[0] }
        : { policyIds: client.policyIds },
  } as T;
};

/**
 * Extracts capabilities from prepareCalls that are useable for sendPreparedCalls.
 * Converts policyIds (array) to policyId (singular) by taking the first element.
 *
 * @param {PrepareCallsCapabilities | undefined} capabilities - The prepareCalls capabilities
 * @returns {SendPreparedCallsCapabilities | undefined} The sendPreparedCalls capabilities, or undefined if no relevant capabilities exist
 */
export const extractCapabilitiesForSending = (
  capabilities: PrepareCallsCapabilities | undefined,
): SendPreparedCallsCapabilities | undefined => {
  const paymasterService = capabilities?.paymasterService;
  const sendPreparedCallsPaymasterService =
    paymasterService != null
      ? {
          policyId:
            "policyId" in paymasterService
              ? paymasterService.policyId
              : paymasterService.policyIds[0],
          webhookData: paymasterService.webhookData,
        }
      : undefined;

  if (
    capabilities?.permissions == null &&
    sendPreparedCallsPaymasterService == null
  ) {
    return undefined;
  }

  return {
    permissions: capabilities?.permissions,
    paymasterService: sendPreparedCallsPaymasterService,
  };
};
