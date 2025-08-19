import { createClient, type Client } from "viem";
import { headersUpdate } from "../tracing/updateHeaders.js";
import {
  alchemyTransport,
  convertHeadersToObject,
  type AlchemyTransport,
} from "../transport/alchemy.js";

/**
 * TODO: need to figure out if there's a better way than this...
 * This adds a tracing breadcrumb to the client during requests.
 * It returns a basic client without the previously extended actions.
 * That means you MUST use viem's `getAction` method within actions in case the action is being called from an action that attached a breadcrumb.
 * That method works by taking a fallback, looking up the action on the client, if it finds it calls it, otherwise it calls the fallback.
 *
 * @param {Client<AlchemyTransport>} client a client using the alchemy transport
 * @param {string} breadcrumb the breadcrumb to add to the tracing headers
 * @returns {Client<AlchemyTransport>} a client with the transport updated to include the breadcrumb
 */
export function addBreadCrumb(
  client: Client<AlchemyTransport>,
  breadcrumb: string,
): Client<AlchemyTransport> {
  const oldConfig = client.transport.config;
  const dynamicFetchOptions = client.transport.fetchOptions;
  const newTransport = alchemyTransport({ ...oldConfig });
  newTransport.updateHeaders(
    headersUpdate(breadcrumb)(
      convertHeadersToObject(dynamicFetchOptions?.headers),
    ),
  );

  return createClient({
    ...client,
    transport: newTransport,
    chain: client.chain,
  });
}
