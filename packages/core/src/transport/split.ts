import { custom, type CustomTransport, type Transport } from "viem";

export interface SplitTransportParams {
  overrides: {
    methods: string[];
    transport: Transport;
  }[];
  fallback: Transport;
}

/**
 * The Split Transport allows you to split RPC traffic for specific methods across
 * different RPC providers. This is done by specifying the methods you want handled
 * specially as overrides and providing a fallback transport for all other methods.
 *
 * @example
 * ```ts
 * import { createPublicClient, http } from "viem";
 * import { split } from "@alchemy/aa-core";
 *
 * const bundlerMethods = [
 *  "eth_sendUserOperation",
 *  "eth_estimateUserOperationGas",
 *  "eth_getUserOperationReceipt",
 *  "eth_getUserOperationByHash",
 *  "eth_supportedEntryPoints"
 * ];
 *
 * const clientWithSplit = createPublicClient({
 *  transport: split({
 *      overrides: [{
 *          methods: bundlerMethods,
 *          transport: http(BUNDLER_RPC_URL)
 *      }]
 *      fallback: http(OTHER_RPC_URL)
 *  }),
 * });
 * ```
 *
 * @param params {@link SplitTransportParams} split transport configuration containing the methods overrides and fallback transport
 * @returns a {@link CustomTransport} that splits traffic
 */
export const split = (params: SplitTransportParams): CustomTransport => {
  const overrideMap = params.overrides.reduce((accum, curr) => {
    curr.methods.forEach((method) => {
      if (accum.has(method) && accum.get(method) !== curr.transport) {
        throw new Error(
          "A method cannot be handled by more than one transport"
        );
      }

      accum.set(method, curr.transport);
    });

    return accum;
  }, new Map<string, Transport>());

  return (opts) =>
    custom({
      request: async (args) => {
        const transportOverride = overrideMap.get(args.method);
        if (transportOverride != null) {
          return transportOverride(opts).request(args);
        }

        return params.fallback(opts).request(args);
      },
    })(opts);
};
