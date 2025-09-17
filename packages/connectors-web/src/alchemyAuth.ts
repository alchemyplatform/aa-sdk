import { createConnector } from "@wagmi/core";
import type { CreateConnectorFn } from "wagmi";
import {
  createWebAuthClient,
  type WebAuthClientParams,
} from "@alchemy/auth-web";
import type { AuthClient, AuthSession } from "@alchemy/auth";
import { type Address, type EIP1193Provider } from "viem";

export interface AlchemyAuthOptions
  extends Pick<
    WebAuthClientParams,
    | "createTekStamper"
    | "createWebAuthnStamper"
    | "iframeElementId"
    | "iframeContainerId"
  > {
  /** Session configuration bubbled straight to the signer */
  sessionConfig?: { expiryInSeconds?: number; sessionKey?: string };
  /** API key for authentication with Alchemy services */
  // TODO: remove this once we use alchemy transport. Optional for now to avoid unnecessary errors.
  apiKey?: string;
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
 * @param {CreateTekStamperFn} [options.createTekStamper] - Optional custom TEK stamper factory for  React Native
 * @param {CreateWebAuthnStamperFn} [options.createWebAuthnStamper] - Optional custom WebAuthn stamper factory for passkey authentication
 * @param {object} [options.sessionConfig] - Session configuration bubbled straight to the signer
 * @param {number} [options.sessionConfig.expiryInSeconds] - Session expiry time in seconds
 * @param {string} [options.sessionConfig.sessionKey] - Custom session key
 * @returns {CreateConnectorFn} A Wagmi connector factory compatible with `createConfig`.
 */
export function alchemyAuth(options: AlchemyAuthOptions): CreateConnectorFn {
  type Provider = EIP1193Provider;
  type Properties = {
    getAuthClient(): AuthClient;
    getAuthSession(): Promise<AuthSession>;
    setAuthSession(authSession: AuthSession): void;
  };

  // Shared instances
  let authSessionInstance: AuthSession | undefined;
  let authClientInstance: AuthClient | undefined;
  let currentChainId: number | undefined;

  return createConnector<Provider, Properties>((config) => {
    const emitAndThrowError = (message: string) => {
      const error = new Error(message);
      config.emitter.emit("error", { error });
      throw error;
    };

    return {
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
          emitAndThrowError(
            "No signer available. Please authenticate first using sendEmailOtp and submitOtpCode, or loginWithOauth.",
          );
        }

        const accounts = await this.getAccounts();
        if (accounts.length === 0) {
          throw new Error("No accounts available from authSession");
        }

        const resolvedChainId = chainId ?? config.chains[0]?.id;
        if (!resolvedChainId) {
          emitAndThrowError(
            "No chain ID available. Please provide a chainId parameter or configure chains in your wagmi config.",
          );
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
          if (authSessionInstance) {
            await authSessionInstance.disconnect();
          }
          authSessionInstance = undefined;
          authClientInstance = undefined;
          currentChainId = undefined;
        } catch (error) {
          // Log disconnect errors but don't throw to avoid breaking flow
          config.emitter.emit("error", { error: error as Error });
        }
      },

      async getAccounts(): Promise<readonly Address[]> {
        if (!authSessionInstance) {
          return [];
        }

        const address = authSessionInstance.getAddress();
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
        // Check if we have a valid authSession instance
        return authSessionInstance !== undefined;
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
        if (!options.apiKey) {
          emitAndThrowError(
            "Authentication required. Please configure the alchemyAuth connector with an apiKey.",
          );
        }

        if (!authClientInstance) {
          authClientInstance = createWebAuthClient({
            apiKey: options.apiKey!,
            iframeElementId: options.iframeElementId,
            iframeContainerId: options.iframeContainerId,
            createTekStamper: options.createTekStamper,
            createWebAuthnStamper: options.createWebAuthnStamper,
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
    };
  });
}
