import type { ClientMiddlewareConfig } from "@aa-sdk/core";
import { erc7677Middleware } from "@aa-sdk/core";

/**
 * Paymaster middleware factory that uses Alchemy's Gas Manager for sponsoring transactions.
 *
 * @example
 *  ```ts
 * import { sepolia, alchemyErc7677Middleware } from "@account-kit/infra";
 * import { http } from "viem";
 *
 * const client = createSmartAccountClient({
 *  transport: http("rpc-url"),
 *  chain: sepolia,
 *  ...alchemyErc7677Middleware("policyId")
 * });
 * ```
 *
 * @param {string | string[]} policyId the policyId (or list of policyIds) for Alchemy's gas manager
 * @returns {Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData">} partial client middleware configuration containing `dummyPaymasterAndData` and `paymasterAndData`
 */
export function alchemyGasManagerMiddleware(
  policyId: string | string[]
): Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData"> {
  return erc7677Middleware<{ policyId: string | string[] }>({
    context: { policyId: policyId },
  });
}
