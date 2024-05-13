import { AlchemySignerStatus } from "../signer/index.js";
import { reconnect } from "./actions/reconnect.js";
import { convertSignerStatusToState } from "./store/client.js";
import type { AccountState, ClientState } from "./store/types";
import type { AlchemyAccountsConfig } from "./types";

/**
 * Will hydrate the client store with the provided initial state if one is provided.
 *
 * @param config the config containing the client store
 * @param initialState optional param detailing the initial ClientState
 * @returns an object containing an onMount function that can be called when your component first renders on the client
 */
export function hydrate(
  config: AlchemyAccountsConfig,
  initialState?: ClientState
) {
  if (initialState && !config.clientStore.persist.hasHydrated()) {
    const { accounts, accountConfigs, signerStatus, ...rest } = initialState;
    const shouldReconnectAccounts =
      signerStatus.isConnected || signerStatus.isAuthenticating;
    const laState: AccountState<"LightAccount"> =
      accountConfigs.LightAccount && shouldReconnectAccounts
        ? {
            status: "RECONNECTING",
            account: {
              address: accountConfigs.LightAccount.accountAddress!,
            },
          }
        : {
            status: "DISCONNECTED",
            account: undefined,
          };

    const maState: AccountState<"MultiOwnerModularAccount"> =
      accountConfigs.MultiOwnerModularAccount && shouldReconnectAccounts
        ? {
            status: "RECONNECTING",
            account: {
              address: accountConfigs.MultiOwnerModularAccount.accountAddress!,
            },
          }
        : {
            status: "DISCONNECTED",
            account: undefined,
          };

    config.clientStore.setState({
      ...rest,
      accountConfigs,
      signerStatus: convertSignerStatusToState(
        AlchemySignerStatus.INITIALIZING
      ),
      accounts: {
        LightAccount: laState,
        MultiOwnerModularAccount: maState,
      },
    });
  }

  return {
    async onMount() {
      if (config._internal.ssr) {
        await config.clientStore.persist.rehydrate();
        await config.coreStore.persist.rehydrate();
      }

      await reconnect(config);
    },
  };
}
