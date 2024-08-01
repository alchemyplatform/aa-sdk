import type { UserOperationContext } from "../actions/smartAccount/types";
import type { ClientMiddlewareFn } from "./types";

/**
 * Noop middleware that does nothing and passes the arguments through
 *
 * @param {Deferrable<UserOperationStruct<TEntryPointVersion>>} args the client middleware arguments passed to the middleware
 * @returns {Promise<Deferrable<UserOperationStruct<TEntryPointVersion>>>} the arguments passed to the middleware and returned as is without modification
 */
export const noopMiddleware: ClientMiddlewareFn<
  UserOperationContext | undefined
> = async (args) => {
  return args;
};
