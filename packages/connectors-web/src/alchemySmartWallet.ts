import { createConnector, type CreateConnectorFn } from "wagmi";

export type AlchemySmartWalletOptions = {
  createBaseConnector: CreateConnectorFn;
};

alchemySmartWallet.type = "alchemy-smart-wallet" as const;

type Provider = any; // TODO: Define proper provider type
type Properties = {
  readonly baseConnector: ReturnType<CreateConnectorFn>;
};

export function alchemySmartWallet({
  createBaseConnector,
}: AlchemySmartWalletOptions): CreateConnectorFn<Provider, Properties> {
  return createConnector((config) => {
    const baseConnector = createBaseConnector(config);

    return {
      id: "alchemySmartWallet",
      name: "Alchemy Smart Wallet",
      type: alchemySmartWallet.type,
      baseConnector,

      async setup(): Promise<void> {
        await baseConnector.setup?.();

        // Optional function for running when the connector is first created.
        throw new Error("Not implemented: setup");
      },

      async connect(parameters) {
        await baseConnector.connect(parameters);
        throw new Error("Not implemented: connect");
      },

      async disconnect() {
        await baseConnector.disconnect?.();
        throw new Error("Not implemented: disconnect");
      },

      async getAccounts() {
        // TODO: Get the account from the signer
        return [];
      },

      async getChainId() {
        // TODO: the connector will need to presist the chain id and instantiate the client/provider with it
        throw new Error("Not implemented: getChainId");
      },

      async getProvider() {
        throw new Error("Not implemented: getProvider");
      },

      async isAuthorized() {
        throw new Error("Not implemented: isAuthorized");
      },

      async switchChain({ chainId }) {
        void chainId;
        throw new Error("Not implemented: switchChain");
      },

      async onAccountsChanged(accounts) {
        void accounts;
        throw new Error("Not implemented: onAccountsChanged");
      },

      onChainChanged(chain) {
        void chain;
        throw new Error("Not implemented: onChainChanged");
      },

      async onConnect() {
        throw new Error("Not implemented: onConnect");
      },

      async onDisconnect() {
        throw new Error("Not implemented: onDisconnect");
      },
    };
  });
}
