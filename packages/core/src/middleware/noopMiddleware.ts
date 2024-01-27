import type { ClientMiddlewareFn } from "./types";

export const noopMiddleware: ClientMiddlewareFn = async (args) => {
  return args;
};
