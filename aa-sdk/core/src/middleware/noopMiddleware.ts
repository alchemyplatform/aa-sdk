import type { ClientMiddlewareFn } from "./types";

/**
 * Noop middleware that does nothing and passes the arguments through
 *
 * @async
 * @param args the client middleware arguments passed to the middleware
 * @returns the arguments passed to the middleware and returned as is without modification
 */
export const noopMiddleware: ClientMiddlewareFn = async (args) => {
  return args;
};
