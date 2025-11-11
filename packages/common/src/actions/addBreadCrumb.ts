import { createClient, type Client } from "viem";
import { headersUpdate } from "../tracing/updateHeaders.js";
import {
  alchemyTransport,
  isAlchemyTransport,
  type AlchemyTransport,
  type AlchemyTransportConfig,
} from "../transport/alchemy.js";
import { convertHeadersToObject } from "../utils/headers.js";

// Internal helper to safely access Alchemy transport internals for header updates
function getAlchemyTransportContext(client: Client) {
  if (!client?.transport || !client?.chain) return null;
  if (!isAlchemyTransport(client.transport as any, client.chain as any))
    return null;
  const transport = client.transport as AlchemyTransport;
  const instance = transport({ chain: client.chain });
  return {
    transport,
    config: instance.value?.config as AlchemyTransportConfig | undefined,
    headers: instance.value?.fetchOptions?.headers as HeadersInit | undefined,
  } as const;
}

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
    const ctx = getAlchemyTransportContext(client);
    if (!ctx?.config) return client;

    const newTransport = alchemyTransport({ ...ctx.config });
    newTransport.updateHeaders(
      headersUpdate(breadcrumb)(convertHeadersToObject(ctx.headers)),
    );

    // Override only the request function so method typings remain intact.
    const wrappedRequest = ((args: Parameters<TClient["request"]>[0]) =>
      createClient({
        chain: client.chain,
        transport: newTransport,
      }).request(
        args as unknown as Parameters<Client["request"]>[0],
      )) as TClient["request"];

    const wrapped = {
      ...(client as unknown as Record<string, unknown>),
      request: wrappedRequest,
    } as TClient;
    return wrapped;
  } catch {
    // On any unexpected shape, return original client to avoid breaking calls.
    return client;
  }
}

/**
 * Performs a single request with a breadcrumb appended to headers, deriving the
 * breadcrumb from the request method. If the client is not using the Alchemy
 * transport, the request is sent as-is.
 *
 * @param {Client} client The client used to send the request.
 * @param {object} req The request object for the client's `request` method.
 * @returns {Promise<unknown>} The result of the client's `request` call.
 */
export function requestWithBreadcrumb<
  C extends {
    request: (req: any) => any;
  } & Partial<{ transport: unknown; chain: unknown }>,
>(client: C, req: Parameters<C["request"]>[0]): ReturnType<C["request"]> {
  const breadcrumb = (req as { method?: string })?.method ?? "";
  try {
    const ctx = getAlchemyTransportContext(client as unknown as Client);
    if (!ctx) return client.request(req);

    const merged = headersUpdate(breadcrumb)(
      convertHeadersToObject(ctx.headers),
    );
    ctx.transport.updateHeaders(merged);
    return client.request(req) as ReturnType<C["request"]>;
  } catch {
    return client.request(req) as ReturnType<C["request"]>;
  }
}
