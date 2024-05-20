import type { Address, NoUndefined } from "@alchemy/aa-core";
import { AlchemySignerStatus } from "../signer/index.js";
import { reconnect } from "./actions/reconnect.js";
import {
  convertSignerStatusToState,
  defaultAccountState,
} from "./store/client.js";
import type { AccountState, ClientState } from "./store/types";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "./types";

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

    config.clientStore.setState({
      ...rest,
      accountConfigs,
      signerStatus: convertSignerStatusToState(
        AlchemySignerStatus.INITIALIZING
      ),
      accounts: hydrateAccountState(accountConfigs, shouldReconnectAccounts),
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

const reconnectingState = <T extends SupportedAccountTypes>(
  address: Address
): AccountState<T> => ({
  status: "RECONNECTING",
  account: {
    address,
  },
});

const hydrateAccountState = (
  accountConfigs: ClientState["accountConfigs"],
  shouldReconnectAccounts: boolean
): ClientState["accounts"] => {
  return Object.entries(accountConfigs).reduce((acc, [chainKey, config]) => {
    const chainId = Number(chainKey);

    acc[chainId].LightAccount =
      config.LightAccount && shouldReconnectAccounts
        ? reconnectingState(config.LightAccount.accountAddress!)
        : defaultAccountState();

    acc[chainId].MultiOwnerModularAccount =
      config.MultiOwnerModularAccount && shouldReconnectAccounts
        ? reconnectingState(config.MultiOwnerModularAccount.accountAddress!)
        : defaultAccountState();

    return acc;
  }, {} as NoUndefined<ClientState["accounts"]>);
};
