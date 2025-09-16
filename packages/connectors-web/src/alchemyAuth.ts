import { createConnector } from "@wagmi/core";
import type { CreateConnectorFn } from "wagmi";
import { createWebAuthClient } from "@alchemy/signer-web";
import type {
  AuthClient,
  CreateTekStamperFn,
  CreateWebAuthnStamperFn,
} from "@alchemy/signer";
import type { Signer } from "@alchemy/signer";
import { getAddress, type Address, type EIP1193Provider } from "viem";

export interface AlchemyAuthOptions {
  /** Optional custom TEK stamper factory for power users / React Native */
  createTekStamper?: CreateTekStamperFn;
  /** Optional custom WebAuthn stamper factory for passkey authentication */
  createWebAuthnStamper?: CreateWebAuthnStamperFn;
  /** Session configuration bubbled straight to the signer */
  sessionConfig?: { expiryInSeconds?: number; sessionKey?: string };
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
 * @param {AlchemyAuthOptions} options - Configuration for the connector
 * @param {string} [options.apiKey] - API key for authentication with Alchemy services
 * @param {string} [options.iframeElementId] - Optional ID for the iframe element used by Turnkey stamper
 * @param {string} [options.iframeContainerId] - Optional ID for the container element that holds the iframe
 * @returns {CreateConnectorFn} A Wagmi connector factory compatible with `createConfig`.
 */
export function alchemyAuth(options: AlchemyAuthOptions): CreateConnectorFn {
  const parameters = options;
  type Provider = EIP1193Provider;
  type Properties = {
    getAuthClient(): AuthClient;
    getSigner(): Promise<Signer>;
    setSigner(signer: Signer): void;
  };

  // Shared instances
  let signerInstance: Signer | undefined;
  let authClientInstance: AuthClient | undefined;
  let currentChainId: number | undefined;

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
      if (!signerInstance) {
        const error = new Error(
          "No signer available. Please authenticate first using sendEmailOtp and submitOtpCode, or loginWithOauth.",
        );
        config.emitter.emit("error", { error });
        throw error;
      }

      const accounts = await this.getAccounts();
      if (accounts.length === 0) {
        const error = new Error("No accounts available from signer");
        config.emitter.emit("error", { error });
        throw error;
      }

      const resolvedChainId = chainId ?? config.chains[0]?.id;
      if (!resolvedChainId) {
        const error = new Error(
          "No chain ID available. Please provide a chainId parameter or configure chains in your wagmi config.",
        );
        config.emitter.emit("error", { error });
        throw error;
      }

      currentChainId = resolvedChainId;

      return {
        accounts,
        chainId: resolvedChainId,
      };
    },

    async disconnect() {
      try {
        // Clean up instances
        if (signerInstance) {
          await signerInstance.disconnect();
        }
        signerInstance = undefined;
        authClientInstance = undefined;
        currentChainId = undefined;
      } catch (error) {
        // Log disconnect errors but don't throw to avoid breaking flow
        config.emitter.emit("error", { error: error as Error });
      }
    },

    async getAccounts(): Promise<readonly Address[]> {
      if (!signerInstance) {
        return [];
      }

      const address = getAddress(signerInstance.getAddress());
      return [address];
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

    async getProvider(): Promise<Provider> {
      // TODO: Implement proper provider when Signer EIP-1193 support is available
      // For now, throw an error as the provider is not yet implemented
      throw new Error("Provider not implemented.");
    },

    async isAuthorized() {
      // Check if we have a valid signer instance
      return signerInstance !== undefined;
    },

    async switchChain({ chainId }) {
      currentChainId = chainId;
      const targetChain = config.chains.find((chain) => chain.id === chainId);
      if (!targetChain) {
        throw new Error(`Chain with id ${chainId} not found in config`);
      }

      return targetChain;
    },

    async onAccountsChanged(accounts) {
      // Handle account changes - for now just emit the accounts
      // In a full implementation, we might need to update internal state
      if (accounts.length === 0) {
        await this.disconnect();
      }
    },

    onChainChanged(chainId) {
      // Update the current chain ID when chain changes
      currentChainId = parseInt(chainId, 16);
    },

    async onConnect(connectInfo) {
      // Handle successful connection
      // This is typically called after authentication completes
      void connectInfo;
    },

    async onDisconnect(error) {
      // Handle disconnection
      await this.disconnect();
      if (error) {
        config.emitter.emit("error", { error });
      }
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
          createTekStamper: parameters.createTekStamper,
          createWebAuthnStamper: parameters.createWebAuthnStamper,
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
