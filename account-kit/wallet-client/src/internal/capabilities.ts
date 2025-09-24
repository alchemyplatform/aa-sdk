import type { Capabilities } from "@alchemy/wallet-api-types/capabilities";
import type { InnerWalletApiClientBase } from "../types.js";

export const mergeClientCapabilities = (
  client: InnerWalletApiClientBase,
  capabilities: Capabilities | undefined,
) => {
  return client.policyIds?.length
    ? {
        ...capabilities,
        paymasterService: {
          ...capabilities?.paymasterService,
          policyIds: client.policyIds,
        },
      }
    : capabilities;
};
