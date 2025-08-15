import {
  createConnector,
  // type Connector,
} from "@wagmi/core";

export interface AlchemyAuthOptions {
  // web-specific: popup OAuth, iframe, cookie/session opts, etc.
}

alchemyAuth.type = "alchemy-auth" as const;

/**
 * Creates the Alchemy Auth connector for Wagmi (scaffolded).
 *
 * This function returns a connector factory via Wagmi's `createConnector`.
 *
 * Reference: Creating Connectors (Wagmi)
 *
 * @see https://wagmi.sh/dev/creating-connectors
 *
 * @param {AlchemyAuthOptions} parameters - Optional configuration for the connector.
 * @returns {ReturnType<typeof createConnector>} A Wagmi connector compatible with `createConfig`.
 */
export function alchemyAuth(parameters: AlchemyAuthOptions = {}) {
  // TODO: remove this
  void parameters;

  type Provider = any; // TODO: Define proper provider type
  type Properties = {
    getAuthClient(): Promise<any>; // TODO: Define proper auth client type
    getSigner(): Promise<any>; // TODO: Define proper signer type
  };

  // Shared instances
  let signerInstance: any; // AlchemyWebSigner | undefined
  void signerInstance;
  let authClientInstance: any | undefined;
  void authClientInstance;

  // Event listeners
  // let accountsChanged: Connector['onAccountsChanged'] | undefined
  // let chainChanged: Connector['onChainChanged'] | undefined
  // let connect: Connector['onConnect'] | undefined
  // let disconnect: Connector['onDisconnect'] | undefined

  return createConnector<Provider, Properties>((config) => ({
    id: "alchemyAuth",
    name: "Alchemy Auth",
    type: alchemyAuth.type,

    async setup() {
      // TODO: remove this void
      void config;

      // Optional function for running when the connector is first created.
      throw new Error("Not implemented: setup");
    },

    async connect({ chainId } = {}) {
      void chainId;
      throw new Error("Not implemented: connect");
    },

    async disconnect() {
      // Clean up instances, may need to reinitialize a new authClientInstance
      signerInstance = undefined;
      authClientInstance = undefined;

      // TODO: Implement actual disconnect logic
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

    // Custom methods for Alchemy Auth
    async getAuthClient() {
      // Stub for now – will be implemented in a future iteration
      throw new Error("Not implemented: getAuthClient");
    },

    async getSigner() {
      // Stub for now – will be implemented in a future iteration
      throw new Error("Not implemented: getSigner");
    },

    setSigner(signer: any) {
      signerInstance = signer;
    },
  }));
}
