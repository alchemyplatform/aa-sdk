import type { ClientMiddlewareFn } from "./types";

/**
 *
 * @returns
 */
export const noopMiddleware: ClientMiddlewareFn = async (args) => {
  return args;
};
