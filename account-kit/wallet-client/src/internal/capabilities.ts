import type { Capabilities } from "@alchemy/wallet-api-types/capabilities";
import type { InnerWalletApiClientBase } from "../types.js";

/**
 * Merges client capabilities with capabilities from the request.
 *
 * @param {InnerWalletApiClientBase} client - The inner wallet API client (potentially including global capabilities like policy IDs)
 * @param {Capabilities | undefined} capabilities - Request capabilities to merge with, if any
 * @returns {Capabilities | undefined} The merged capabilities object, or original capabilities if no capability configuration exists on the client
 */
export const mergeClientCapabilities = (
  client: InnerWalletApiClientBase,
  capabilities: Capabilities | undefined,
): Capabilities | undefined => {
  return client.policyIds?.length
    ? {
        ...capabilities,
        paymasterService: {
          policyIds: client.policyIds,
          ...capabilities?.paymasterService,
        },
      }
    : capabilities;
};
