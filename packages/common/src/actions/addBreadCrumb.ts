import { createClient, type Client } from "viem";
import { headersUpdate } from "../tracing/updateHeaders.js";
import {
  alchemyTransport,
  isAlchemyTransport,
  isAlchemyTransportConfig,
  type AlchemyTransport,
  type AlchemyTransportConfig,
} from "../transport/alchemy.js";
import { convertHeadersToObject } from "../utils/headers.js";

// Internal helper to safely access Alchemy transport internals for header updates
function getAlchemyTransportContext(client: Client | any) {
  const chain = client?.chain;
  const t = client?.transport;
  if (!t || !chain) return null;

  // Case 1: callable transport
  if (typeof t === "function") {
    if (!isAlchemyTransport(t, chain)) return null;
    const transport = t as unknown as AlchemyTransport;
    const instance = transport({ chain });
    return {
      config: instance.value?.config as AlchemyTransportConfig | undefined,
      headers: instance.value?.fetchOptions?.headers as HeadersInit | undefined,
      updateHeaders: (h: HeadersInit) => transport.updateHeaders(h),
    } as const;
  }

  // Case 2: transport instance/config stored on client
  if (isAlchemyTransportConfig(t)) {
    const headers = t?.value?.fetchOptions?.headers as HeadersInit | undefined;
    const cfg = (t as any)?.value?.config as AlchemyTransportConfig | undefined;
    return {
      config: cfg,
      headers,
      updateHeaders: (h: HeadersInit) => {
        const current = convertHeadersToObject(headers);
        const merged = { ...current, ...convertHeadersToObject(h) };
        if (t?.value?.fetchOptions) {
          t.value.fetchOptions.headers = merged;
        }
      },
    } as const;
  }

  return null;
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

    // Build merged headers and create a fresh transport to avoid shared-state races.
    const merged = headersUpdate(breadcrumb)(
      convertHeadersToObject(ctx.headers),
    );
    const newTransport = alchemyTransport({
      ...(ctx.config || {}),
      fetchOptions: {
        ...(ctx.config?.fetchOptions || {}),
        headers: merged,
      },
    });

    const tempClient = createClient({
      chain: (client as any).chain,
      transport: newTransport,
    });

    return tempClient.request(req as any) as ReturnType<C["request"]>;
  } catch {
    // Generic fallback to avoid breaking calls from unexpected shapes or breadcrumbs.
    return client.request(req) as ReturnType<C["request"]>;
  }
}
