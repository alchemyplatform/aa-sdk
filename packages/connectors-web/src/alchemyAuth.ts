import {
  createConnector,
  // type Connector,
} from "@wagmi/core";
import { createWebAuthClient } from "@alchemy/signer-web";
import type { AuthClient } from "@alchemy/signer";
import type { Signer } from "@alchemy/signer";

export interface AlchemyAuthOptions {
  /** API key for authentication with Alchemy services */
  apiKey: string;
  /** Optional ID for the iframe element used by Turnkey stamper. Defaults to "turnkey-iframe" */
  iframeElementId?: string;
  /** Optional ID for the container element that holds the iframe. Defaults to "turnkey-iframe-container" */
  iframeContainerId?: string;
}

alchemyAuth.type = "alchemy-auth" as const;

/**
 * Creates the Alchemy Auth connector for Wagmi.
 *
 * This function returns a connector factory via Wagmi's `createConnector`.
 *
 * Reference: Creating Connectors (Wagmi)
 *
 * @see https://wagmi.sh/dev/creating-connectors
 *
 * @param {AlchemyAuthOptions} parameters - Configuration for the connector
 * @param {string} parameters.apiKey - API key for authentication with Alchemy services
 * @param {string} [parameters.iframeElementId] - Optional ID for the iframe element used by Turnkey stamper
 * @param {string} [parameters.iframeContainerId] - Optional ID for the container element that holds the iframe
 * @returns {ReturnType<typeof createConnector>} A Wagmi connector compatible with `createConfig`.
 */
export function alchemyAuth(parameters: AlchemyAuthOptions) {
  if (!parameters.apiKey) {
    throw new Error("AlchemyAuthOptions.apiKey is required");
  }

  type Provider = any; // TODO: Define proper provider type
  type Properties = {
    getAuthClient(): Promise<AuthClient>;
    getSigner(): Promise<Signer>;
    setSigner(signer: Signer): void;
  };

  // Shared instances
  let signerInstance: Signer | undefined;
  let authClientInstance: AuthClient | undefined;

  // Event listeners
  // let accountsChanged: Connector['onAccountsChanged'] | undefined
  // let chainChanged: Connector['onChainChanged'] | undefined
  // let connect: Connector['onConnect'] | undefined
  // let disconnect: Connector['onDisconnect'] | undefined

  return createConnector<Provider, Properties>((_config) => ({
    id: "alchemyAuth",
    name: "Alchemy Auth",
    type: alchemyAuth.type,

    async setup() {
      // Optional function for running when the connector is first created.
      // For now, we don't need any specific setup logic
    },

    async connect({ chainId } = {}) {
      // Connection is handled through the auth flow (sendEmailOtp -> submitOtpCode)
      // This method is called by wagmi after authentication completes
      if (!signerInstance) {
        throw new Error(
          "No signer available. Please authenticate first using sendEmailOtp and submitOtpCode.",
        );
      }

      const accounts = await this.getAccounts();
      if (accounts.length === 0) {
        throw new Error("No accounts available from signer");
      }

      return {
        accounts,
        chainId: chainId || 1, // Default to mainnet if not specified
      };
    },

    async disconnect() {
      // Clean up instances
      signerInstance = undefined;
      authClientInstance = undefined;
    },

    async getAccounts() {
      if (!signerInstance) {
        return [];
      }

      try {
        // Get the address from the signer
        const address = signerInstance.getAddress() as `0x${string}`;
        return [address];
      } catch {
        return [];
      }
    },

    async getChainId() {
      // For now, return mainnet. In the future, this should be configurable
      // and potentially stored based on user selection or last used chain
      return 1; // mainnet
    },

    async getProvider() {
      // Return a basic provider-like object
      // This may need to be enhanced based on actual usage patterns
      return {
        request: async () => {
          throw new Error("Provider request not implemented");
        },
      };
    },

    async isAuthorized() {
      // Check if we have a valid signer instance
      return signerInstance !== undefined;
    },

    async switchChain({ chainId }) {
      // For now, just return a basic chain object
      // In the future, this should update the provider/signer configuration
      return {
        id: chainId,
        name: `Chain ${chainId}`,
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: { default: { http: [""] }, public: { http: [""] } },
      };
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
      if (!authClientInstance) {
        authClientInstance = createWebAuthClient({
          apiKey: parameters.apiKey,
          iframeElementId: parameters.iframeElementId,
          iframeContainerId: parameters.iframeContainerId,
        });
      }
      return authClientInstance;
    },

    async getSigner() {
      if (!signerInstance) {
        throw new Error("Signer not available. Please authenticate first.");
      }
      return signerInstance;
    },

    setSigner(signer: Signer) {
      signerInstance = signer;
    },
  }));
}
