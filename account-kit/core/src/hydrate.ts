import type { Address } from "@aa-sdk/core";
import { AlchemySignerStatus } from "@account-kit/signer";
import { hydrate as wagmi_hydrate } from "@wagmi/core";
import { reconnect } from "./actions/reconnect.js";
import {
  convertSignerStatusToState,
  createDefaultAccountState,
  defaultAccountState,
} from "./store/client.js";
import type { AccountState, ClientState, StoredState } from "./store/types.js";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "./types.js";

export type HydrateResult = {
  onMount: () => Promise<void>;
};

/**
 * Will hydrate the client store with the provided initial state if one is provided.
 *
 * @example
 * ```ts
 * import { hydrate, cookieToInitialState } from "@account-kit/core";
 * import { config } from "./config";
 *
 * const initialState = cookieToInitialState(document.cookie);
 * const { onMount } = hydrate(config, initialState);
 * // call onMount once your component has mounted
 * ```
 *
 * @param {AlchemyAccountsConfig} config the config containing the client store
 * @param {StoredState} initialState optional param detailing the initial ClientState
 * @returns {{ onMount: () => Promise<void> }} an object containing an onMount function that can be called when your component first renders on the client
 */
export function hydrate(
  config: AlchemyAccountsConfig,
  initialState?: StoredState
): HydrateResult {
  const initialAlchemyState =
    initialState != null && "alchemy" in initialState
      ? initialState.alchemy
      : initialState;

  if (initialAlchemyState && !config.clientStore.persist.hasHydrated()) {
    const { accountConfigs, signerStatus, ...rest } = initialAlchemyState;
    const shouldReconnectAccounts =
      signerStatus.isConnected || signerStatus.isAuthenticating;

    config.clientStore.setState({
      ...rest,
      accountConfigs,
      signerStatus: convertSignerStatusToState(
        AlchemySignerStatus.INITIALIZING
      ),
      accounts: hydrateAccountState(
        accountConfigs,
        shouldReconnectAccounts,
        config
      ),
    });
  }

  const initialWagmiState =
    initialState != null && "wagmi" in initialState
      ? initialState.wagmi
      : undefined;
  const { onMount: wagmi_onMount } = wagmi_hydrate(
    config._internal.wagmiConfig,
    {
      initialState: initialWagmiState,
      reconnectOnMount: true,
    }
  );

  return {
    async onMount() {
      if (config._internal.ssr) {
        await config.clientStore.persist.rehydrate();
        await config.coreStore.persist.rehydrate();
      }

      await wagmi_onMount();

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
  shouldReconnectAccounts: boolean,
  config: AlchemyAccountsConfig
): ClientState["accounts"] => {
  const chains = Array.from(
    config.coreStore.getState().connections.entries()
  ).map(([, cnx]) => cnx.chain);
  const initialState = createDefaultAccountState(chains);

  return Object.entries(accountConfigs).reduce((acc, [chainKey, config]) => {
    const chainId = Number(chainKey);
    acc[chainId] = {
      LightAccount:
        config.LightAccount && shouldReconnectAccounts
          ? reconnectingState(config.LightAccount.accountAddress!)
          : defaultAccountState(),
      MultiOwnerModularAccount:
        config.MultiOwnerModularAccount && shouldReconnectAccounts
          ? reconnectingState(config.MultiOwnerModularAccount.accountAddress!)
          : defaultAccountState(),
    };

    return acc;
  }, initialState);
};
