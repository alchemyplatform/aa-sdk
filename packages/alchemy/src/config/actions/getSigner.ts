import type { AlchemySigner } from "../../signer/signer.js";
import type { AlchemyAccountsConfig } from "../types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { hydrate } from "../hydrate.js";

/**
 * If there is a signer attached to the client state, it will return it.
 * The signer should always be null on the server, and will be set on the client
 * if the store was properly hydrated. (see {@link hydrate})
 *
 * @param config The account config which contains the client store
 * @returns the instance of the signer present in the store if it exists, otherwise null
 */
export const getSigner = (
  config: AlchemyAccountsConfig
): AlchemySigner | null => {
  return config.clientStore.getState().signer ?? null;
};
