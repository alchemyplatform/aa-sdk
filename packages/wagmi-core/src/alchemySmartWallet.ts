import { alchemyTransport, BaseError } from "@alchemy/common";
import {
  createEip1193Provider,
  type SmartWalletClientEip1193Provider,
} from "@alchemy/wallet-apis";
import { ALCHEMY_SMART_WALLET_CONNECTOR_TYPE } from "./constants.js";
import { Emitter } from "@wagmi/core/internal";
import {
  createWalletClient,
  custom,
  type Account,
  type Address,
  type Chain,
  type EIP1193Provider,
  type ProviderConnectInfo,
  type Transport,
  type WalletClient,
  type Client,
  createClient,
} from "viem";
import { createConnector, type CreateConnectorFn } from "wagmi";

/** Options used to create the Alchemy Smart Wallet connector. */
export type AlchemySmartWalletOptions = {
  /** The base connector which will sign for the smart wallet. */
  ownerConnector: CreateConnectorFn;
  /** Paymaster policy ID to be used for gas sponsorship */
  policyId?: string;
  /** Paymaster policy IDs to be used for gas sponsorship */
  policyIds?: string[];
  /** API key for Alchemy authentication */
  apiKey?: string;
  /** JWT token for authentication */
  jwt?: string;
  /** Custom API URL (optional - defaults to Alchemy's API URL, but can be used to override the chain's Alchemy URL) */
  url?: string;
  /** Account type to create. Use "7702" for EIP-7702 delegation (requires local signer), or "sma-b" for SMA-B. Defaults to "sma-b". */
  accountType?: "7702" | "sma-b";
};

alchemySmartWallet.type = ALCHEMY_SMART_WALLET_CONNECTOR_TYPE;

type Provider = SmartWalletClientEip1193Provider;
type Properties = {
  readonly ownerConnector: ReturnType<CreateConnectorFn>;
};

type ConnectResult = {
  accounts: Address[];
  chainId: number;
};

type ChangeEvent = {
  chainId?: number;
  accounts?: Address[];
};

/**
 * Creates a Wagmi connector that uses Alchemy's Wallet API to perform actions
 * using a smart account. It wraps a base connector and uses it to sign
 * transactions.
 *
 * @param {AlchemySmartWalletOptions} options - The options for the Alchemy Smart Wallet connector.
 * @param {CreateConnectorFn} options.innerConnector - The base connector to use to sign transactions.
 * @param {string} options.apiKey - The API key to use to authenticate with Alchemy.
 * @param {string} options.jwt - The JWT to use to authenticate with Alchemy.
 * @param {string} options.url - Custom RPC URL (optional - defaults to Alchemy's API URL, but can be used to override the chain's Alchemy URL)
 * @returns {CreateConnectorFn} The Alchemy Smart Wallet connector, which can be passed to Wagmi's `createConfig`.
 */
export function alchemySmartWallet(
  options: AlchemySmartWalletOptions,
): CreateConnectorFn<Provider, Properties> {
  return createConnector((config) => {
    // `config` contains an event emitter that all of Wagmi listens to. Don't
    // let the inner connector get its hands on it: we want to fully encapsulate
    // the inner connector so it doesn't affect global state. Note that the uid
    // doesn't matter since this emitter is internal to this connector instance.
    const innerEmitter = new Emitter("inner-uid");
    const innerConnector = options.ownerConnector({
      ...config,
      emitter: innerEmitter,
    });

    /*
     * We'll return this useless provider when the smart wallet connector is not
     * connected. We need to return _something_ in response to `getProvider`
     * even when not connected, or Wagmi will skip over this connector.
     *
     * TODO: Should we return the same provider instance every time, with that
     * instance being a proxy object routing to either this or the real provider
     * if it exists? We would need to do that if Wagmi held on to a provider
     * that it first got during initialization. It doesn't seem to do that
     * today, but what if it changed behavior?
     */
    const loggedOutProvider: Provider = {
      on: () => {},
      removeListener: () => {},
      request: async (requestParams) => {
        if (requestParams.method === "eth_accounts") {
          return [] as any;
        }
        const baseProvider = (await innerConnector.getProvider()) as any;
        return baseProvider.request(requestParams);
      },
    };

    const transport = alchemyTransport({
      apiKey: options.apiKey,
      jwt: options.jwt,
      url: options.url ?? "https://api.g.alchemy.com/v2",
    });
    let providerPromise: Promise<SmartWalletClientEip1193Provider> | undefined;
    let currentChainId: number | undefined;
    let currentInnerAccount: Address | undefined;

    const resetState = (): void => {
      providerPromise = undefined;
      currentChainId = undefined;
      currentInnerAccount = undefined;
      clients = {};
    };

    const getSignerClient = async (
      chain: Chain,
    ): Promise<WalletClient<Transport, Chain, Account>> => {
      // Try to get a wallet client from the inner connector, otherwise create
      // one from its provider.
      if (innerConnector.getClient) {
        const client = await innerConnector.getClient({
          chainId: currentChainId,
        });
        if ("signMessage" in client) {
          // Assume that a client which has `signMessage` is a wallet client.
          return client as WalletClient<Transport, Chain, Account>;
        }
      }
      const innerAccounts = await innerConnector.getAccounts();
      if (innerAccounts.length === 0) {
        throw new BaseError("No accounts found in base connector");
      }
      const signerAddress = innerAccounts[0];
      const provider = (await innerConnector.getProvider()) as EIP1193Provider;
      const signer = createWalletClient({
        account: signerAddress,
        chain,
        transport: custom(provider),
      });
      return signer;
    };

    const createProvider =
      async (): Promise<SmartWalletClientEip1193Provider> => {
        const chainId = await innerConnector.getChainId();
        const chain = getChainFromConfig(config, chainId);
        const signer = await getSignerClient(chain);

        return createEip1193Provider(
          {
            signer,
            transport,
            chain,
            policyId: options.policyId,
            policyIds: options.policyIds,
          },
          // TODO(v5): support other account params
          // https://app.asana.com/1/1129441638109975/project/1210112085973163/task/1211568982181252
          {
            accountType: options.accountType ?? "sma-b",
          },
        );
      };

    const initializeSmartWalletClient = async (): Promise<void> => {
      providerPromise = createProvider();
      const provider = await providerPromise;
      const innerAccounts = await innerConnector.getAccounts();
      if (innerAccounts.length === 0) {
        throw new BaseError("No accounts found in owner connector");
      }
      const chainId = await provider.request({ method: "eth_chainId" });
      currentChainId = +chainId;
      currentInnerAccount = innerAccounts[0];
    };

    // A trivial function, but gives a name to indicate how the promise is used.
    const getProviderIfConnected = async (): Promise<
      SmartWalletClientEip1193Provider | undefined
    > => {
      return providerPromise;
    };

    const getAccounts = async (): Promise<Address[]> => {
      const provider = await getProviderIfConnected();
      if (!provider) {
        return [];
      }
      return provider.request({ method: "eth_accounts" });
    };

    // TODO: to be robust, we should have handling for additional updates
    // occurring while a previous update is still in progress.

    // The following "outer" functions update this connector's state without
    // touching the inner connector. This lets us reuse logic between when a
    // change is triggered externally (in which case we need to notify the inner
    // connector) vs when it's triggered by the inner connector itself (in which
    // case we don't).

    /**
     * Handles a change event for this connector, emitting its own change event after updating its state.
     *
     * @param {ChangeEvent} event - The change event.
     * @returns {Promise<void>} A promise that resolves when the change event has been handled.
     */
    const outerHandleChange = async ({
      chainId,
      accounts,
    }: ChangeEvent): Promise<void> => {
      const innerAccount = accounts?.[0];
      const chainIdChanged = chainId !== currentChainId;
      const innerAccountChanged = innerAccount !== currentInnerAccount;
      if (!chainIdChanged && !innerAccountChanged) {
        return;
      }
      currentChainId = chainId;
      currentInnerAccount = innerAccount;
      try {
        await initializeSmartWalletClient();
      } catch (error) {
        resetState();
        throw error;
      }
      config.emitter.emit("change", {
        ...(chainIdChanged && { chainId }),
        ...(innerAccountChanged && { accounts: await getAccounts() }),
      });
    };

    /**
     * Handles connecting to a chain for this connector without touching the inner
     * connector.
     *
     * @param {number} chainId - The chain ID to connect to.
     * @returns {ConnectResult} The smart account address and chain ID.
     */
    const outerConnect = async (chainId: number): Promise<ConnectResult> => {
      resetState();
      await initializeSmartWalletClient();
      const accounts = await getAccounts();
      config.emitter.emit("connect", { chainId, accounts });
      return { accounts, chainId };
    };

    /**
     * Handles disconnection of this connector without touching the inner
     * connector.
     */
    const outerDisconnect = (): void => {
      resetState();
      config.emitter.emit("disconnect");
    };

    /**
     * Handles switching the chain for this connector without touching the inner
     * connector.
     *
     * @param {number} chainId - The chain ID to switch to.
     */
    const outerSwitchChain = async (chainId: number): Promise<void> => {
      await outerHandleChange({ chainId });
    };

    innerEmitter.on("connect", (params) => {
      // The inner connector may emit a connect event while we're already
      // connected. If so, we should emit a change event instead.
      const connectResult = params as any as ConnectResult;
      // TODO: if we add more robust handling around simultaneous updates, we
      // should modify this check for connected status.
      if (currentInnerAccount != null) {
        outerHandleChange(connectResult);
      } else {
        outerConnect(connectResult.chainId);
      }
    });
    innerEmitter.on("disconnect", outerDisconnect);
    innerEmitter.on("change", (event) => {
      outerHandleChange(event as any as ChangeEvent);
    });

    // Cache clients by chainId to avoid recreating them unnecessarily.
    let clients: Record<number, Client> = {};

    return {
      id: `alchemySmartWallet:${innerConnector.id}`,
      name: "Alchemy Smart Wallet",
      type: alchemySmartWallet.type,
      ownerConnector: innerConnector,

      async setup(): Promise<void> {
        await innerConnector.setup?.();
      },

      async connect(params): Promise<ConnectResult> {
        const { chainId } = await innerConnector.connect(params);
        return outerConnect(chainId);
      },

      async disconnect(): Promise<void> {
        await innerConnector.disconnect?.();
        outerDisconnect();
      },

      getAccounts,

      async getChainId(): Promise<number> {
        return innerConnector.getChainId();
      },

      async getProvider(): Promise<Provider> {
        const provider = await getProviderIfConnected();
        return provider ?? loggedOutProvider;
      },

      // We need to implement this so that we can check if the client is an alchemy smart
      // wallet client, otherwise wagmi will init clients w/ the name "Connector Client",
      // then we have no way to check in wagmi actions if it's an alchemy smart wallet
      // client or not. It's also necessary to call certain client actions that are
      // not implemented on the provider (i.e. `prepareCalls` & `signPreparedCalls`).
      async getClient() {
        if (!currentChainId) {
          throw new BaseError("No chain ID set");
        }

        if (clients[currentChainId]) {
          return clients[currentChainId];
        }

        const [account] = await getAccounts();
        const chain = getChainFromConfig(config, currentChainId);
        const provider = await this.getProvider();
        const policyIds = [
          ...(options.policyId ? [options.policyId] : []),
          ...(options.policyIds ?? []),
        ];
        const signerClient = await getSignerClient(chain);
        // Create a minimal client instead of using `createSmartWalletClient` to keep actions
        // tree-shakable, using the 1193 provider for compatibility with wagmi's built-in hooks.
        const client = createClient({
          account,
          chain,
          name: "alchemySmartWalletClient",
          transport: (opts) => custom(provider)({ ...opts, retryCount: 0 }),
        }).extend(() => ({
          policyIds,
          owner: signerClient,
        }));
        clients[currentChainId] = client;
        return client;
      },

      async isAuthorized(): Promise<boolean> {
        return innerConnector.isAuthorized();
      },

      async switchChain(params): Promise<Chain> {
        const { chainId } = params;
        const baseChain = await innerConnector.switchChain?.(params);
        const chain = baseChain ?? getChainFromConfig(config, chainId);
        await outerSwitchChain(chainId);
        return chain;
      },

      onAccountsChanged(accounts): void {
        innerConnector.onAccountsChanged(accounts);
      },

      onChainChanged(chain: string): void {
        innerConnector.onChainChanged(chain);
      },

      onConnect(connectInfo: ProviderConnectInfo): void {
        innerConnector.onConnect?.(connectInfo);
      },

      onDisconnect(): void {
        innerConnector.onDisconnect?.();
      },
    };
  });
}

function getChainFromConfig(
  { chains }: Parameters<CreateConnectorFn>[0],
  chainId: number,
): Chain {
  if (chains.length === 0) {
    throw new BaseError("Config must contain at least one chain");
  }
  const chain = chains.find((chain) => chain.id === chainId);
  if (!chain) {
    throw new BaseError(`Chain with id ${chainId} not found in config`);
  }
  return chain;
}
