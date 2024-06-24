import { createSigner } from "../store/store.js";
import type { AlchemyAccountsConfig } from "../types.js";
import { createAccount } from "./createAccount.js";
import { getChain } from "./getChain.js";

/**
 * This method will use the current state in the client store and attempt to restore
 * connected instances of previously used accounts and the signer.
 *
 * @param config the account config which contains the client store
 */
export async function reconnect(config: AlchemyAccountsConfig) {
  const { store } = config;
  const signerConfig = store.getState().config;
  const accountConfigs = store.getState().accountConfigs;

  const signer = createSigner(signerConfig);
  const chain = getChain(config);
  store.setState({
    signer,
  });

  const unsubConnected = signer.on("connected", async () => {
    if (accountConfigs[chain.id]?.["LightAccount"]) {
      await createAccount(
        {
          type: "LightAccount",
          accountParams: accountConfigs[chain.id]["LightAccount"],
        },
        config
      );
    }

    if (accountConfigs[chain.id]?.["MultiOwnerModularAccount"]) {
      await createAccount(
        {
          type: "MultiOwnerModularAccount",
          accountParams: accountConfigs[chain.id]["MultiOwnerModularAccount"],
        },
        config
      );
    }

    unsubConnected();
  });

  const unsubDisconnected = signer.on("disconnected", () => {
    store.setState({
      accountConfigs: {},
    });
    unsubDisconnected();
  });
}
