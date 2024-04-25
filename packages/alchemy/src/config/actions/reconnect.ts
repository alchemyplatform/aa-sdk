import { createSigner } from "../store/client.js";
import type { AlchemyAccountsConfig } from "../types";
import { createAccount } from "./createAccount.js";

/**
 * This method will use the current state in the client store and attempt to restore
 * connected instances of previously used accounts and the signer.
 *
 * @param config the account config which contains the client store
 */
export async function reconnect(config: AlchemyAccountsConfig) {
  const { clientStore } = config;
  const signerConfig = clientStore.getState().config;
  const accountConfigs = clientStore.getState().accountConfigs;

  const signer = createSigner(signerConfig);
  clientStore.setState({
    signer,
  });

  const unsubConnected = signer.on("connected", async () => {
    if (accountConfigs["LightAccount"]) {
      await createAccount(
        {
          type: "LightAccount",
          accountParams: accountConfigs["LightAccount"],
        },
        config
      );
    }

    if (accountConfigs["MultiOwnerModularAccount"]) {
      await createAccount(
        {
          type: "MultiOwnerModularAccount",
          accountParams: accountConfigs["MultiOwnerModularAccount"],
        },
        config
      );
    }

    unsubConnected();
  });

  const unsubDisconnected = signer.on("disconnected", () => {
    clientStore.setState({
      accountConfigs: {},
    });
    unsubDisconnected();
  });
}
