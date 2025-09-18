import { createConnector } from "@wagmi/core";
import { createWebAuthClient } from "@alchemy/auth-web";
import type { AuthClient } from "@alchemy/auth";
import type { AuthSession } from "@alchemy/auth";
import { type Address } from "viem";

// TODO: Support other connection config options.
export interface AlchemyAuthOptions {
  /** API key for authentication with Alchemy services */
  apiKey?: string;
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
 * @param {string} [parameters.apiKey] - API key for authentication with Alchemy services
 * @param {string} [parameters.iframeElementId] - Optional ID for the iframe element used by Turnkey stamper
 * @param {string} [parameters.iframeContainerId] - Optional ID for the container element that holds the iframe
 * @returns {ReturnType<typeof createConnector>} A Wagmi connector compatible with `createConfig`.
 */
export function alchemyAuth(parameters: AlchemyAuthOptions = {}) {
  type Provider = any; // TODO: Define proper provider type
  type Properties = {
    getAuthClient(): AuthClient;
    getAuthSession(): Promise<AuthSession>;
    setAuthSession(authSession: AuthSession): void;
  };

  // Shared instances
  let authSessionInstance: AuthSession | undefined;
  let authClientInstance: AuthClient | undefined;
  let currentChainId: number | undefined;

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
      // Optional function for running when the connector is first created.
      // For now, we don't need any specific setup logic
    },

    async connect({ chainId } = {}) {
      // Connection is handled through the auth flow (sendEmailOtp -> submitOtpCode)
      // This method is called by wagmi after authentication completes
      if (!authSessionInstance) {
        // TODO(v5): Update error message to reflect different auth methods available.
        throw new Error(
          "No auth session available. Please authenticate first using sendEmailOtp and submitOtpCode.",
        );
      }

      const accounts = await this.getAccounts();
      if (accounts.length === 0) {
        throw new Error("No accounts available from authSession");
      }

      const resolvedChainId = chainId ?? config.chains[0]?.id;
      if (!resolvedChainId) {
        throw new Error(
          "No chain ID available. Please provide a chainId parameter or configure chains in your wagmi config.",
        );
      }

      // Remember the connected chain ID
      currentChainId = resolvedChainId;

      return {
        accounts,
        chainId: resolvedChainId,
      };
    },

    async disconnect() {
      // Clean up instances
      await authSessionInstance?.disconnect();
      authSessionInstance = undefined;
      authClientInstance = undefined;
      currentChainId = undefined;
    },

    async getAccounts(): Promise<readonly Address[]> {
      if (!authSessionInstance) {
        return [];
      }

      const address = authSessionInstance.getAddress();
      return [address as Address];
    },

    async getChainId() {
      // Return the currently connected chain, or fall back to first configured chain
      const resolvedChainId = currentChainId ?? config.chains[0]?.id;
      if (!resolvedChainId) {
        throw new Error(
          "No chain configured. Please configure chains in your wagmi config.",
        );
      }
      return resolvedChainId;
    },

    async getProvider({ chainId: _chainId } = { chainId: undefined }) {
      if (!authSessionInstance) {
        throw new Error(
          "No auth session available. Please authenticate first.",
        );
      }
      return authSessionInstance.getProvider();
    },

    async isAuthorized() {
      // Check if we have a valid authSession instance
      return authSessionInstance !== undefined;
    },

    async switchChain({ chainId }) {
      // Update the current chain ID
      currentChainId = chainId;

      // For now, just return a basic chain object
      // In the future, this should update the provider/auth session configuration
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
    getAuthClient() {
      // TODO: Expand this to support other auth methods (jwt, rpcUrl) when
      // AlchemyConnectionConfig pattern is adopted in future PR
      if (!parameters.apiKey) {
        const error = new Error(
          "Authentication required. Please configure the alchemyAuth connector with an apiKey.",
        );
        config.emitter.emit("error", { error });
        throw error;
      }

      if (!authClientInstance) {
        authClientInstance = createWebAuthClient({
          apiKey: parameters.apiKey!,
          iframeElementId: parameters.iframeElementId,
          iframeContainerId: parameters.iframeContainerId,
        });
      }
      return authClientInstance;
    },

    async getAuthSession() {
      if (!authSessionInstance) {
        throw new Error(
          "authSession not available. Please authenticate first.",
        );
      }
      return authSessionInstance;
    },

    setAuthSession(authSession: AuthSession) {
      authSessionInstance = authSession;
    },

    setSigner(signer: any) {
      // Store the signer instance for future use
      // For now, we'll just store it as part of the auth session or connector state
      // This method is called after successful authentication to provide the signer
      console.log("Signer set:", signer);
    },
  }));
}
