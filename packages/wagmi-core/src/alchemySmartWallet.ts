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
  accounts?: readonly Address[];
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
        if (client) {
          return client as any;
        }
      }
      const innerAccounts = await innerConnector.getAccounts();
      if (innerAccounts.length === 0) {
        throw new BaseError("No accounts found in base connector");
      }
      const signerAddress = innerAccounts[0];
      const baseProvider = (await innerConnector.getProvider()) as any;
      const signer = createWalletClient({
        account: signerAddress,
        chain,
        transport: custom(baseProvider),
      });
      return signer;
    };

    async function getProviderIfConnected(): Promise<Provider | undefined> {
      if (!providerPromise) return undefined;
      try {
        const provider = await providerPromise;
        return provider;
      } catch {
        return undefined;
      }
    }

    const getAccounts = async (): Promise<Address[]> => {
      const baseAccounts = await innerConnector.getAccounts();
      if (baseAccounts.length === 0) {
        throw new BaseError("No accounts found in owner connector");
      }
      const signer = baseAccounts[0];
      if (!providerPromise) {
        return [signer];
      }
      const provider = await providerPromise;
      try {
        const accounts = await provider.request({ method: "eth_accounts" });
        return (accounts as any).length > 0 ? accounts : [signer];
      } catch {
        return [signer];
      }
    };

    const outerHandleChange = async (event: ChangeEvent): Promise<void> => {
      // Detect account changes.
      if (event.accounts) {
        const innerAccount = event.accounts[0];
        if (innerAccount !== currentInnerAccount) {
          currentInnerAccount = innerAccount;
          config.emitter.emit("change", { accounts: await getAccounts() });
        }
      }

      // Detect chain changes.
      if (event.chainId && event.chainId !== currentChainId) {
        currentChainId = event.chainId;
        config.emitter.emit("change", { chainId: currentChainId });
      }
    };

    const outerConnect = async (chainId: number): Promise<ConnectResult> => {
      resetState();
      currentChainId = chainId;
      const chain = getChainFromConfig(config, chainId);
      providerPromise = Promise.resolve(
        createEip1193Provider(
          {
            chain,
            transport,
            signer: await getSignerClient(chain),
            policyId: options.policyId,
            policyIds: options.policyIds,
          },
          {},
        ),
      );

      config.emitter.emit("connect", {
        account: (await getAccounts())[0],
        chainId,
        provider: await providerPromise,
      } as any);

      return { chainId, accounts: await getAccounts() };
    };

    const outerDisconnect = (): void => {
      if (providerPromise) {
        const provider = providerPromise;
        // Ignore the result of this promise.
        void provider.then((_provider) => {
          // No-op: provider cleanup not required
        });
      }
      resetState();
      config.emitter.emit("disconnect");
    };

    const outerSwitchChain = async (chainId: number): Promise<void> => {
      // Track whether we're switching a chain via external invocation or an inner connector event.
      // If invoked externally, emit a change event after switching.
      // If triggered by an inner connector event, connect will follow and emit the proper events.
      const isExternalInvocation = chainId !== currentChainId;
      const connectResult = await innerConnector.connect({ chainId });
      if (isExternalInvocation) {
        outerHandleChange(connectResult);
      } else {
        outerConnect(connectResult.chainId);
      }
    };
    innerEmitter.on("disconnect", outerDisconnect);
    innerEmitter.on("change", (event) => {
      outerHandleChange(event as any as ChangeEvent);
    });
    innerEmitter.on("connect", (params) => {
      const connectResult = params as any as ConnectResult;
      if (currentInnerAccount != null) {
        outerHandleChange(connectResult);
      } else {
        outerConnect(connectResult.chainId);
      }
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
