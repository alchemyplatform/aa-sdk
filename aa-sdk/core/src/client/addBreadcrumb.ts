/**
 * The symbol that is used to add a breadcrumb to the headers. Is an optional
 * function that is used to add a breadcrumb to the headers.
 */
export const ADD_BREADCRUMB = Symbol("addBreadcrumb");

function hasAddBreadcrumb<A extends {}>(
  a: A,
): a is A & { [ADD_BREADCRUMB]: (breadcrumb: string) => A } {
  return ADD_BREADCRUMB in a;
}

/**
 * Add a crumb to the breadcrumb.
 *
 * @param {X} client Clients are somethings like viem, that we are adding breadcrumbs to, and could be owning the transport. Usually a alchemy client.
 * @param {string} crumb The crumb to add to the breadcrumb
 * @returns {Function} A function that updates the headers
 */
export function clientHeaderTrack<X extends {}>(client: X, crumb: string): X {
  if (hasAddBreadcrumb(client)) {
    return client[ADD_BREADCRUMB](crumb);
  }
  return client;
}
