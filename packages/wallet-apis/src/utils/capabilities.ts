import type {
  PrepareCallsCapabilities as RpcPrepareCallsCapabilities,
  SendPreparedCallsCapabilities as RpcSendPreparedCallsCapabilities,
} from "@alchemy/wallet-api-types/capabilities";
import type { InnerWalletApiClient } from "../types.js";

/**
 * Renames `paymasterService` (RPC) to `paymaster` in a capabilities type. This
 * is because our RPC schema's paymasterService capability does not exactly match
 * the shape of the new spec, so we want to use a different name in our client
 * types to avoid confusion and be compatible with Viem's types.
 */
type ResolveCapabilities<T> = T extends {
  paymasterService?: infer P;
}
  ? Omit<T, "paymasterService"> & { paymaster?: P }
  : T;

export type PrepareCallsCapabilities =
  ResolveCapabilities<RpcPrepareCallsCapabilities>;

export type SendPreparedCallsCapabilities =
  ResolveCapabilities<RpcSendPreparedCallsCapabilities>;

/**
 * Transforms a type so that any `capabilities` field uses `paymaster`
 * instead of `paymasterService` (RPC).
 */
export type WithCapabilities<T> = T extends {
  capabilities?: infer C;
}
  ? Omit<T, "capabilities"> & {
      capabilities?: ResolveCapabilities<NonNullable<C>>;
    }
  : T;

function isRpcCapabilities(
  value: object,
): value is RpcPrepareCallsCapabilities | RpcSendPreparedCallsCapabilities {
  return !("paymaster" in value);
}

function isResolvedCapabilities(
  value: object,
): value is PrepareCallsCapabilities | SendPreparedCallsCapabilities {
  return "paymasterService" in value;
}

/**
 * Converts capabilities (with `paymaster`) to RPC capabilities (with `paymasterService`)
 * for use with Value.Encode before sending to the RPC.
 *
 * @param {PrepareCallsCapabilities | SendPreparedCallsCapabilities | undefined} capabilities - Capabilities object containing a `paymaster` field
 * @returns {RpcPrepareCallsCapabilities | RpcSendPreparedCallsCapabilities | undefined} RPC capabilities with `paymasterService`, or undefined if input is undefined
 */
export function toRpcCapabilities(
  capabilities:
    | PrepareCallsCapabilities
    | SendPreparedCallsCapabilities
    | undefined,
): RpcPrepareCallsCapabilities | RpcSendPreparedCallsCapabilities | undefined {
  if (!capabilities) return undefined;
  const { paymaster, ...rest } = capabilities;
  const result =
    paymaster !== undefined
      ? { ...rest, paymasterService: paymaster }
      : { ...rest };
  if (isRpcCapabilities(result)) return result;
  return undefined;
}

/**
 * Converts RPC capabilities (with `paymasterService`) from Value.Decode
 * to capabilities (with `paymaster`).
 *
 * @param {RpcPrepareCallsCapabilities | RpcSendPreparedCallsCapabilities | undefined} capabilities - RPC capabilities object containing a `paymasterService` field
 * @returns {PrepareCallsCapabilities | SendPreparedCallsCapabilities | undefined} Capabilities with `paymaster`, or undefined if input is undefined
 */
export function fromRpcCapabilities(
  capabilities:
    | RpcPrepareCallsCapabilities
    | RpcSendPreparedCallsCapabilities
    | undefined,
): PrepareCallsCapabilities | SendPreparedCallsCapabilities | undefined {
  if (!capabilities) return undefined;
  if ("paymasterService" in capabilities) {
    const { paymasterService, ...rest } = capabilities;
    const result =
      paymasterService !== undefined
        ? { ...rest, paymaster: paymasterService }
        : { ...rest };
    if (isResolvedCapabilities(result)) return result;
    return undefined;
  }
  if (isResolvedCapabilities(capabilities)) return capabilities;
  return undefined;
}

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
  if (!client.policyIds?.length || capabilities?.paymaster) {
    return capabilities;
  }

  return {
    ...capabilities,
    paymaster:
      client.policyIds.length === 1
        ? { policyId: client.policyIds[0] }
        : { policyIds: client.policyIds },
  } as T;
};

/**
 * Extracts capabilities from prepareCalls that are usable for sendPreparedCalls.
 * Only permissions and paymaster (policyId/policyIds & webhookData) are supported.
 *
 * @param {PrepareCallsCapabilities | undefined} capabilities - The prepareCalls capabilities
 * @returns {SendPreparedCallsCapabilities | undefined} The sendPreparedCalls capabilities, or undefined if no relevant capabilities exist
 */
export const extractCapabilitiesForSending = (
  capabilities: PrepareCallsCapabilities | undefined,
): SendPreparedCallsCapabilities | undefined => {
  if (capabilities?.permissions == null && capabilities?.paymaster == null) {
    return undefined;
  }

  const paymaster = capabilities.paymaster;

  return {
    permissions: capabilities.permissions,
    paymaster:
      paymaster != null
        ? {
            ...("policyId" in paymaster
              ? { policyId: paymaster.policyId }
              : { policyIds: paymaster.policyIds }),
            webhookData: paymaster.webhookData,
          }
        : undefined,
  };
};
