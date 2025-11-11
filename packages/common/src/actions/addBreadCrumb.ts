import { createClient, type Client } from "viem";
import { headersUpdate } from "../tracing/updateHeaders.js";
import { alchemyTransport, isAlchemyTransport } from "../transport/alchemy.js";
import { convertHeadersToObject } from "../utils/headers.js";

/**
 * Adds a tracing breadcrumb to outgoing requests for the provided client.
 *
 * The returned client preserves the original shape and extensions. Its `request`
 * method is overridden to forward through a transport that appends the
 * breadcrumb and trace headers. If the client does not use the Alchemy
 * transport, the original client is returned unchanged.
 *
 * @param {Client} client The client to wrap.
 * @param {string} breadcrumb The breadcrumb label to append to headers.
 * @returns {Client} A client whose `request` sends the given breadcrumb.
 */
export function addBreadCrumb<TClient extends Client>(
  client: TClient,
  breadcrumb: string,
): TClient {
  // Only apply when using the Alchemy transport; otherwise keep client unchanged.
  try {
    if (!client?.transport || !client?.chain) return client;
    if (!isAlchemyTransport(client.transport as any, client.chain))
      return client;

    const oldConfig = (client.transport as any).config;
    const dynamicFetchOptions = (client.transport as any).fetchOptions;
    const newTransport = alchemyTransport({ ...oldConfig });
    newTransport.updateHeaders(
      headersUpdate(breadcrumb)(
        convertHeadersToObject(dynamicFetchOptions?.headers),
      ),
    );

    // Override only the request function so method typings remain intact.
    const wrappedRequest = ((args: Parameters<TClient["request"]>[0]) =>
      createClient({
        ...(client as unknown as Record<string, unknown>),
        transport: newTransport,
        chain: client.chain,
      } as any).request(args as any)) as TClient["request"];

    const wrapped = {
      ...(client as unknown as Record<string, unknown>),
      request: wrappedRequest,
    } as unknown as TClient;
    return wrapped;
  } catch {
    // On any unexpected shape, return original client to avoid breaking calls.
    return client;
  }
}

/**
 * Performs a single request with a breadcrumb appended to headers, preserving
 * the client's exact request typing. If the client is not using the Alchemy
 * transport, the request is sent as-is.
 *
 * @param {Client} client The client used to send the request.
 * @param {string} breadcrumb The breadcrumb label to append.
 * @param {object} req The exact request object for the client's `request` method.
 * @returns {Promise<unknown>} The result of the client's `request` call.
 */
export function requestWithBreadcrumb<TClient extends Client>(
  client: TClient,
  breadcrumb: string,
  req: Parameters<TClient["request"]>[0],
): ReturnType<TClient["request"]> {
  try {
    if (!client?.transport || !client?.chain) {
      return client.request(req as any) as ReturnType<TClient["request"]>;
    }
    if (!isAlchemyTransport(client.transport as any, client.chain)) {
      return client.request(req as any) as ReturnType<TClient["request"]>;
    }

    const oldConfig = (client.transport as any).config;
    const dynamicFetchOptions = (client.transport as any).fetchOptions;
    const newTransport = alchemyTransport({ ...oldConfig });
    newTransport.updateHeaders(
      headersUpdate(breadcrumb)(
        convertHeadersToObject(dynamicFetchOptions?.headers),
      ),
    );

    const temp = createClient({
      ...(client as unknown as Record<string, unknown>),
      transport: newTransport,
      chain: client.chain,
    } as any);
    return temp.request(req as any) as ReturnType<TClient["request"]>;
  } catch {
    return client.request(req as any) as ReturnType<TClient["request"]>;
  }
}
