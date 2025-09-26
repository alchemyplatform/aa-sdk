import { alchemyTransport } from "@alchemy/common";
import {
  createSmartWalletClient,
  type SmartWalletClient,
  type SmartWalletClientEip1193Provider,
} from "@alchemy/wallet-apis";
import { Emitter } from "@wagmi/core/internal";
import {
  createWalletClient,
  custom,
  type Address,
  type Chain,
  type EIP1193Provider,
  type ProviderConnectInfo,
} from "viem";
import { createConnector, type CreateConnectorFn } from "wagmi";

export type AlchemySmartWalletOptions = {
  /** The base connector which will sign for the smart wallet. */
  baseConnector: CreateConnectorFn;
  /** API key for Alchemy authentication */
  apiKey?: string;
  /** JWT token for authentication */
  jwt?: string;
  /** Custom RPC URL (optional - defaults to Alchemy's API URL, but can be used to override the chain's Alchemy URL) */
  url?: string;
};

alchemySmartWallet.type = "alchemy-smart-wallet" as const;

type Provider = SmartWalletClientEip1193Provider;
type Properties = {
  readonly baseConnector: ReturnType<CreateConnectorFn>;
};

/**
 * Creates a Wagmi connector that uses Alchemy's Wallet API to perform actions
 * using a smart account. It wraps a base connector and uses it to sign
 * transactions.
 *
 * @param {AlchemySmartWalletOptions} options - The options for the Alchemy Smart Wallet connector.
 * @param {CreateConnectorFn} options.baseConnector - The base connector to use to sign transactions.
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
    // let the inner connecter get its hands on it: we want to fully encapsulate
    // it and not let it affect global state. Note that the uid doesn't matter
    // since we're only using this internally.
    //
    // TODO: Listen for inner connect and disconnect events and update state accordingly.
    const innerEmitter = new Emitter("inner-uid");
    const innerConnector = options.baseConnector({
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

    let smartWalletClientPromise: Promise<SmartWalletClient> | undefined;

    const resetState = (): void => {
      smartWalletClientPromise = undefined;
    };

    const createClient = async (): Promise<SmartWalletClient> => {
      const chainId = await innerConnector.getChainId();
      const innerAccounts = await innerConnector.getAccounts();
      if (innerAccounts.length === 0) {
        throw new Error("No accounts found in base connector");
      }
      // TODO: do we always take the first account?
      const signerAddress = innerAccounts[0];
      const chain = getChainFromConfig(config, chainId);
      const provider = (await innerConnector.getProvider()) as EIP1193Provider;
      const signer = createWalletClient({
        account: signerAddress,
        chain,
        transport: custom(provider),
      });
      const smartWalletClient = createSmartWalletClient({
        signer,
        transport: alchemyTransport({
          apiKey: options.apiKey,
          jwt: options.jwt,
          url: options.url ?? "https://api.g.alchemy.com/v2",
        }),
        chain,
      });
      // TODO: Calling `client.getProvider()` has the side effect of
      // initializing `client.account` some time after the provider is created.
      // We should change that so it's explicit and awaitable. Until then,
      // replicate the logic by hand.
      const account = await smartWalletClient.requestAccount();
      smartWalletClient.account = {
        type: "json-rpc",
        address: account.address,
      };
      return smartWalletClient;
    };

    const initializeSmartWalletClient = async (): Promise<void> => {
      smartWalletClientPromise = createClient();
      await smartWalletClientPromise;
    };

    // A trivial function, but gives a name to indicate how the promise is used.
    const getSmartWalletClientIfConnected = async (): Promise<
      SmartWalletClient | undefined
    > => {
      return smartWalletClientPromise;
    };

    return {
      id: "alchemySmartWallet",
      name: "Alchemy Smart Wallet",
      type: alchemySmartWallet.type,
      baseConnector: innerConnector,

      async setup(): Promise<void> {
        await innerConnector.setup?.();
        if (await innerConnector.isAuthorized()) {
          await initializeSmartWalletClient();
        }
      },

      async connect(params): Promise<{ accounts: Address[]; chainId: number }> {
        resetState();
        await innerConnector.connect(params);
        await initializeSmartWalletClient();
        const chainId = params?.chainId ?? (await innerConnector.getChainId());
        const accounts = (await this.getAccounts()) as Address[];
        config.emitter.emit("connect", { chainId, accounts });
        return { accounts, chainId };
      },

      async disconnect(): Promise<void> {
        await innerConnector.disconnect?.();
        resetState();
        config.emitter.emit("disconnect");
      },

      async getAccounts(): Promise<Address[]> {
        const smartWalletClient = await getSmartWalletClientIfConnected();
        const address = smartWalletClient?.account?.address;
        return address ? [address] : [];
      },

      async getChainId(): Promise<number> {
        return innerConnector.getChainId();
      },

      async getProvider(): Promise<Provider> {
        const smartWalletClient = await getSmartWalletClientIfConnected();
        return smartWalletClient?.getProvider() ?? loggedOutProvider;
      },

      async isAuthorized(): Promise<boolean> {
        return innerConnector.isAuthorized();
      },

      async switchChain(params): Promise<Chain> {
        const { chainId } = params;
        const currentChainId = await this.getChainId();
        if (chainId === currentChainId) {
          return getChainFromConfig(config, chainId);
        }
        resetState();
        const baseChain = await innerConnector.switchChain?.(params);
        const chain = baseChain ?? getChainFromConfig(config, chainId);
        await initializeSmartWalletClient();
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
    throw new Error("Config must contain at least one chain");
  }
  const chain = chains.find((chain) => chain.id === chainId);
  if (!chain) {
    throw new Error(`Chain with id ${chainId} not found in config`);
  }
  return chain;
}
