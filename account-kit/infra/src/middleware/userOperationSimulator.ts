import {
  deepHexlify,
  resolveProperties,
  type ClientMiddlewareFn,
  type UserOperationContext,
} from "@aa-sdk/core";
import type { ClientWithAlchemyMethods } from "../client/types";

/**
 * A middleware function to be used during simulation of user operations which leverages Alchemy's RPC uo simulation method.
 *
 * @example
 * ```ts
 * import { alchemyUserOperationSimulator, createAlchemyPublicRpcClient } from "@account-kit/infra";
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * const bundlerClient = createAlchemyPublicRpcClient(...);
 * const client = createSmartAccountClient({
 *  userOperationSimulator: alchemyUserOperationSimulator(bundlerClient),
 *  ...otherParams
 * });
 * ```
 *
 * @template C The client object with Alchemy methods
 * @param {C} client The client object with Alchemy methods
 * @returns {ClientMiddlewareFn} A middleware function to simulate and process user operations
 */
export function alchemyUserOperationSimulator<
  C extends ClientWithAlchemyMethods,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>(client: C): ClientMiddlewareFn<TContext> {
  return async (struct, { account }) => {
    const uoSimResult = await client.request({
      method: "alchemy_simulateUserOperationAssetChanges",
      params: [
        deepHexlify(await resolveProperties(struct)),
        account.getEntryPoint().address,
      ],
    });

    if (uoSimResult.error) {
      throw new Error(uoSimResult.error.message);
    }

    return struct;
  };
}
