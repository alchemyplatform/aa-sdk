import {
  deepHexlify,
  resolveProperties,
  type ClientMiddlewareFn,
  type UserOperationContext,
} from "@aa-sdk/core";
import type { AlchemyTransport } from "../alchemyTransport";

/**
 * A middleware function to be used during simulation of user operations which leverages Alchemy's RPC uo simulation method.
 *
 * @example
 * ```ts
 * import { alchemyUserOperationSimulator, alchemy, sepolia } from "@account-kit/infra";
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * const alchemyTransport = alchemy({
 *  chain: sepolia,
 *  apiKey: "your-api-key"
 * });
 *
 * const client = createSmartAccountClient({
 *  chain: sepolia,
 *  userOperationSimulator: alchemyUserOperationSimulator(alchemyTransport),
 *  ...otherParams
 * });
 * ```
 *
 * @param {AlchemyTransport} transport An Alchemy Transport that can be used for making RPC calls to alchemy
 * @returns {ClientMiddlewareFn} A middleware function to simulate and process user operations
 */
export function alchemyUserOperationSimulator<
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>(transport: AlchemyTransport): ClientMiddlewareFn<TContext> {
  return async (struct, { account, client }) => {
    const uoSimResult = await transport({ chain: client.chain }).request({
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
