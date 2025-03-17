import { custom, type CustomTransport, type Transport } from "viem";
import { headersUpdate } from "../client/updateHeaders.js";

export interface TracingHeadersParams {
  breadcrumb?: string;
  transport: Transport;
}

/**
 * We wanted a transport that is adding the add headers for the headers that we are sending to the server for tracing cross actions
 * and services.
 *
 * @example
 * ```ts
 * import { createPublicClient, http } from "viem";
 * import { tracingHeader } from "@aa-sdk/core";
 *
 * const clientWithTracing = createPublicClient({
 *  transport: tracingHeader({ breadcrumb: 'myMethodOrAction',  transport: http(OTHER_RPC_URL)}),
 * });
 * ```
 *
 * @param {TracingHeadersParams} params tracing headers config to wrap around a transport to add in headers for tracing
 * @returns {CustomTransport} a viem Transport that splits traffic
 */
export const tracingHeader = (
  params: TracingHeadersParams
): CustomTransport => {
  return (opts) =>
    custom({
      request: async (args_) => {
        const previousHeaders: Record<string, string> =
          args_?.fetchOptions?.headers ?? {};
        const headers = headersUpdate(params.breadcrumb || args_.method)(
          previousHeaders
        );
        const args = {
          ...args_,
          fetchOptions: {
            ...args_?.fetchOptions,
            headers,
          },
        };
        return params.transport(opts).request(args);
      },
    })(opts);
};
