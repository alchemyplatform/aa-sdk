import type { AlchemySigner } from "../../signer";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Subscribe to changes of the signer instance on the client store.
 *
 * @param config the account config containing the client store
 * @returns a function which accepts an onChange callback that will be fired when the signer changes
 */
export const watchSigner =
  (config: AlchemyAccountsConfig) =>
  (onChange: (signer?: AlchemySigner) => void) => {
    return config.clientStore.subscribe(({ signer }) => signer, onChange);
  };
