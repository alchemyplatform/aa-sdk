import { createSigner } from "../store/store.js";
import {
  assertIsSuportedAccountType,
  type AlchemyAccountsConfig,
} from "../types.js";
import { createAccount } from "./createAccount.js";
import { getChain } from "./getChain.js";

/**
 * This method will use the current state in the client store and attempt to restore
 * connected instances of previously used accounts and the signer.
 *
 * @example
 * ```ts
 * import { reconnect } from "@account-kit/core";
 * import { config } from "./config";
 *
 * await reconnect(config);
 * ```
 *
 * @param {AlchemyAccountsConfig} config the account config which contains the client store
 */
export async function reconnect(config: AlchemyAccountsConfig) {
  const { store } = config;
  const signerConfig = store.getState().config;
  const accountConfigs = store.getState().accountConfigs;

  const signer = store.getState().signer ?? createSigner(signerConfig);
  if (!store.getState().signer) {
    store.setState({
      signer,
    });
  }

  const chain = getChain(config);

  const unsubConnected = signer.on("connected", async () => {
    const configs = accountConfigs[chain.id];

    for (const [type, modes] of Object.entries(configs ?? {})) {
      assertIsSuportedAccountType(type);
      for (const accountParams of Object.values(modes ?? {})) {
        if (accountParams) {
          await createAccount({ type, accountParams }, config);
        }
      }
    }

    setTimeout(() => unsubConnected(), 1);
  });

  const unsubDisconnected = signer.on("disconnected", () => {
    store.setState({
      accountConfigs: {},
    });
    setTimeout(() => unsubDisconnected(), 1);
  });
}
