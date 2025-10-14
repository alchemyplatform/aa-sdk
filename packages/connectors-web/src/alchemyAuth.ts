import { createConnector } from "@wagmi/core";
import type { CreateConnectorFn } from "wagmi";
import {
  createWebAuthClient,
  type WebAuthClientParams,
} from "@alchemy/auth-web";
import type { AuthClient, AuthSession } from "@alchemy/auth";
import {
  createWalletClient,
  type Address,
  type Client,
  type EIP1193Provider,
} from "viem";
import {
  getStoredAuthSession,
  setStoredAuthSession,
  clearStoredAuthSession,
  getAuthStorageKey,
  type PersistedAuthSession,
} from "./store/authSessionStorage.js";
import { ALCHEMY_AUTH_CONNECTOR_TYPE } from "@alchemy/wagmi-core";

/**
 * Configuration options for the Alchemy Auth connector.
 * Extends Alchemy Auth client parameters with connector-specific options.
 */
export interface AlchemyAuthOptions
  extends Pick<
    WebAuthClientParams,
    | "createTekStamper"
    | "createWebAuthnStamper"
    | "iframeElementId"
    | "iframeContainerId"
  > {
  /** API key for authentication with Alchemy services */
  // TODO: remove this once we use alchemy transport. Optional for now to avoid unnecessary errors.
  apiKey?: string;
}

alchemyAuth.type = ALCHEMY_AUTH_CONNECTOR_TYPE;

/**
 * Creates a Wagmi connector for Alchemy Auth, enabling email-based authentication
 * with embedded wallet capabilities. This connector provides a seamless authentication
 * experience using email OTP or OAuth, with automatic session management and persistence.
 *
 * The connector supports:
 * - Email OTP authentication
 * - OAuth authentication flows
 * - Automatic session persistence and restoration
 * - Cross-tab synchronization
 * - Multi-chain support
 *
 * @example
 * Basic usage with API key:
 * ```ts twoslash
 * import { alchemyAuth } from "@alchemy/connectors-web";
 * import { createConfig } from "wagmi";
 *
 * const config = createConfig({
 *   connectors: [
 *     alchemyAuth({
 *       apiKey: "your-api-key"
 *     })
 *   ]
 * });
 * ```
 *
 * @example
 * With custom iframe configuration:
 * ```ts twoslash
 * import { alchemyAuth } from "@alchemy/connectors-web";
 *
 * const connector = alchemyAuth({
 *   apiKey: "your-api-key",
 *   iframeElementId: "turnkey-iframe",
 *   iframeContainerId: "turnkey-container"
 * });
 * ```
 *
 * @example
 * With custom stamper factories:
 * ```ts twoslash
 * import { alchemyAuth } from "@alchemy/connectors-web";
 *
 * const connector = alchemyAuth({
 *   apiKey: "your-api-key",
 *   createWebAuthnStamper: (config) => customWebAuthnStamper(config),
 *   createTekStamper: (config) => customTekStamper(config)
 * });
 * ```
 *
 * @param {AlchemyAuthOptions} options - Configuration options for the connector
 * @param {string} [options.apiKey] - API key for authentication with Alchemy services
 * @param {string} [options.iframeElementId] - Optional ID for the iframe element used by Turnkey stamper
 * @param {string} [options.iframeContainerId] - Optional ID for the container element that holds the iframe
 * @param {Function} [options.createTekStamper] - Optional custom TEK stamper factory for React Native
 * @param {Function} [options.createWebAuthnStamper] - Optional custom WebAuthn stamper factory for passkey authentication
 * @returns {CreateConnectorFn} A Wagmi connector factory compatible with `createConfig`
 *
 * @see {@link https://wagmi.sh/dev/creating-connectors | Wagmi Creating Connectors Guide}
 */
export function alchemyAuth(options: AlchemyAuthOptions): CreateConnectorFn {
  type Provider = EIP1193Provider;

  /**
   * Custom properties added to the connector for Alchemy Auth functionality.
   * These methods extend the standard Wagmi connector interface.
   */
  type Properties = {
    /**
     * Gets the underlying Alchemy Auth client instance.
     *
     * @returns {AuthClient} The auth client used by this connector
     */
    getAuthClient(): AuthClient;

    /**
     * Gets the current authentication session.
     *
     * @returns {Promise<AuthSession>} Promise resolving to the current auth session
     * @throws {Error} If no auth session is available
     */
    getAuthSession(): Promise<AuthSession>;

    /**
     * Sets the authentication session after successful authentication.
     * This method should be called after completing email OTP or OAuth flows.
     *
     * @param {AuthSession} authSession - The authenticated session to set
     */
    setAuthSession(authSession: AuthSession): void;
  };

  // Shared instances
  let authSessionInstance: AuthSession | undefined;
  let authClientInstance: AuthClient | undefined;
  let currentChainId: number | undefined;

  // Cache clients by chainId to avoid recreating them unnecessarily.
  let clients: Record<number, Client> = {};

  // Store reference to storage event listener for cleanup
  let storageEventListener: ((e: StorageEvent) => void) | undefined;

  // Promise that tracks session restoration to prevent race conditions.
  // This ensures that if multiple methods (getProvider, isAuthorized, etc.)
  // are called before connect(), they all await the same restoration attempt
  // rather than triggering multiple concurrent tryResume() calls.
  // Returns true if the session was restored successfully, false if it was not.
  let resumePromise: Promise<boolean> | undefined;

  let stopListeningForDisconnects: (() => void) | undefined;

  return createConnector<Provider, Properties>((config) => {
    function assertNotNullish<T>(
      value: T,
      message: string,
    ): asserts value is NonNullable<T> {
      if (value == null) {
        const error = new Error(message);
        config.emitter.emit("error", { error });
        throw error;
      }
    }

    // Silent resume logic to try to restore auth session from storage
    async function tryResume(): Promise<boolean> {
      if (authSessionInstance) {
        return true;
      }

      try {
        const persisted = await getStoredAuthSession(config.storage);
        if (!persisted) {
          return false;
        }

        // Attempt to restore the auth session
        const client = getAuthClient();
        // Pass the auth session state directly to restoreAuthSession
        // The auth package will handle validation including expiration checks
        const authSession = await client.restoreAuthSession(
          persisted.authSessionState,
        );
        if (authSession) {
          setAuthSession(authSession);
          currentChainId = persisted.chainId;
          return true;
        }
      } catch (error) {
        // Error during restore - continue to cleanup
        console.warn("Error during auth session restore:", error);
      }

      // Session was expired, invalid, or error occurred - clean up
      await clearStoredAuthSession(config.storage);
      return false;
    }

    async function getAccounts(): Promise<readonly Address[]> {
      if (!authSessionInstance) {
        return [];
      }

      const address = authSessionInstance.getAddress();
      return [address];
    }

    // Helper to persist current auth session state
    async function persistAuthSession(chainId?: number): Promise<void> {
      if (!authSessionInstance) return;

      const resolvedChainId = chainId ?? currentChainId ?? config.chains[0]?.id;
      assertNotNullish(
        resolvedChainId,
        "No chain ID available for persisting auth session. Please ensure currentChainId is set or configure chains in your wagmi config.",
      );

      const toPersist: PersistedAuthSession = {
        version: 1,
        chainId: resolvedChainId,
        authSessionState: authSessionInstance.getSerializedState(),
      };

      await setStoredAuthSession(config.storage, toPersist);
    }

    function getAuthClient(): AuthClient {
      // TODO: Expand this to support other auth methods (jwt, rpcUrl) when
      // AlchemyConnectionConfig pattern is adopted in future PR
      assertNotNullish(
        options.apiKey,
        "Authentication required. Please configure the alchemyAuth connector with an apiKey.",
      );

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
    }

    // Helper to ensure session is restored before use
    async function ensureSession(): Promise<void> {
      if (authSessionInstance) return;

      if (resumePromise) {
        const restored = await resumePromise;
        if (!restored) {
          throw new Error(
            "No auth session available. Please authenticate first using sendEmailOtp/submitOtpCode or loginWithOauth.",
          );
        }
      } else {
        throw new Error(
          "No auth session available. Please authenticate first using sendEmailOtp/submitOtpCode or loginWithOauth.",
        );
      }
    }

    async function disconnect(): Promise<void> {
      stopListeningForDisconnects?.();
      try {
        // Clean up instances
        if (authSessionInstance) {
          authSessionInstance.disconnect();
        }
      } catch (error) {
        // Log disconnect errors but don't throw to avoid breaking flow
        config.emitter.emit("error", { error: error as Error });
      } finally {
        // Always clean up state and storage, even if disconnect fails
        authSessionInstance = undefined;
        authClientInstance = undefined;
        currentChainId = undefined;
        clients = {};
        resumePromise = undefined;
        stopListeningForDisconnects = undefined;

        // Remove storage event listener to prevent memory leaks
        if (typeof window !== "undefined" && storageEventListener) {
          window.removeEventListener("storage", storageEventListener);
          storageEventListener = undefined;
        }

        // Clear persisted storage
        await clearStoredAuthSession(config.storage);
      }
      config.emitter.emit("disconnect");
    }

    function setAuthSession(authSession: AuthSession): void {
      authSessionInstance = authSession;
      // Clear the resume promise since we now have a fresh session
      resumePromise = undefined;

      // Listen for disconnect events and disconnect ourselves when they
      // occur, clearing the previous listener if necessary.
      stopListeningForDisconnects?.();
      stopListeningForDisconnects = authSessionInstance.on(
        "disconnect",
        disconnect,
      );

      // Persist session state immediately
      void persistAuthSession().catch((error) => {
        console.warn("Failed to persist auth session:", error);
        // Don't throw - persistence failure shouldn't break auth flow
      });
    }

    return {
      id: "alchemyAuth",
      name: "Alchemy Auth",
      type: alchemyAuth.type,

      async setup() {
        // Start session restoration early but don't await to avoid blocking setup
        resumePromise = tryResume();
        // Set up cross-tab storage event handling for session synchronization
        // This ensures that when a user logs out in one tab, all other tabs
        // automatically disconnect to prevent stale authentication states
        if (typeof window !== "undefined" && !storageEventListener) {
          storageEventListener = (e: StorageEvent) => {
            // The storage event fires when localStorage is modified in other tabs
            // (it doesn't fire in the same tab that made the change)
            if (e.key?.endsWith(getAuthStorageKey()) && e.newValue === null) {
              // Our auth session was cleared in another tab - disconnect this tab too
              // This prevents scenarios where Tab A logs out but Tab B stays "connected"
              // with a stale session that would fail on actual usage
              disconnect();
            }
          };

          window.addEventListener("storage", storageEventListener);
        }
      },

      async connect({ chainId, isReconnecting } = {}) {
        // Ensure session is restored before connecting
        await ensureSession();

        // Only refresh persisted snapshot on explicit connects, not reconnects
        // During reconnection, we assume the persisted state is already current
        if (!isReconnecting) {
          try {
            await persistAuthSession();
          } catch (error) {
            console.warn(
              "Failed to update persisted session during connect:",
              error,
            );
            // Don't throw - persistence failure shouldn't break connection
          }
        }

        const accounts = await this.getAccounts();
        if (accounts.length === 0) {
          throw new Error("No accounts available from authSession");
        }

        // During reconnection, prioritize the persisted chain ID to maintain session consistency
        // For fresh connections, use the provided chainId parameter
        const resolvedChainId = isReconnecting
          ? (currentChainId ?? chainId ?? config.chains[0]?.id)
          : (chainId ?? currentChainId ?? config.chains[0]?.id);

        assertNotNullish(
          resolvedChainId,
          "No chain ID available. Please provide a chainId parameter or configure chains in your wagmi config.",
        );
        currentChainId = resolvedChainId;

        config.emitter.emit("connect", {
          chainId: resolvedChainId,
          accounts,
        });

        return {
          accounts,
          chainId: resolvedChainId,
        };
      },

      disconnect,

      getAccounts,

      async getChainId() {
        // Return the currently connected chain, or fall back to first configured chain
        const resolvedChainId = currentChainId ?? config.chains[0]?.id;
        assertNotNullish(
          resolvedChainId,
          "No chain configured. Please configure chains in your wagmi config.",
        );
        return resolvedChainId;
      },

      async getProvider() {
        await ensureSession();
        return authSessionInstance!.getProvider();
      },

      // This is optional, but called by `getConnectorClient`. See here: https://github.com/wevm/wagmi/blob/main/packages/core/src/actions/getConnectorClient.ts
      // This enables signing 7702 authorizations, since otherwise wagmi will build a client using the 1193 provider, which is unable to sign authorizations.
      async getClient(params = { chainId: undefined }): Promise<Client> {
        const chainId = params.chainId ?? currentChainId;
        assertNotNullish(chainId, "chainId is required to getClient");

        if (clients[chainId]) {
          return clients[chainId];
        }

        const chain = config.chains.find((chain) => chain.id === chainId);
        assertNotNullish(chain, `Chain with id ${chainId} not found in config`);

        const transport = config.transports?.[chainId];
        if (!transport) {
          throw new Error(
            `No transport found for chain with id ${chainId}. Please configure a transport in your wagmi config.`,
          );
        }

        await ensureSession();
        const account = authSessionInstance!.toViemLocalAccount();

        const client = createWalletClient({
          account,
          transport,
          chain,
          name: "alchemyAuthClient",
        });

        clients[chainId] = client;

        return client;
      },

      async isAuthorized(): Promise<boolean> {
        if (authSessionInstance) {
          return true;
        }

        // If we have a resume promise, wait for it to complete
        if (resumePromise) {
          const restored = await resumePromise;
          if (restored) {
            return true;
          }
        }

        // Fallback to checking storage directly
        const stored = await getStoredAuthSession(config.storage);
        return !!stored;
      },

      async switchChain({ chainId }) {
        currentChainId = chainId;
        const targetChain = config.chains.find((chain) => chain.id === chainId);
        assertNotNullish(
          targetChain,
          `Chain with id ${chainId} not found in config`,
        );

        // Persist the chain change if we have an active session
        try {
          await persistAuthSession(chainId);
        } catch (error) {
          console.warn("Failed to persist chain change:", error);
          // Don't throw - chain switch should still work even if persistence fails
        }

        config.emitter.emit("change", {
          chainId,
          accounts: await this.getAccounts(),
        });

        return targetChain;
      },

      async onAccountsChanged(accounts) {
        // Handle account changes - for now just emit the accounts
        // In a full implementation, we might need to update internal state
        if (accounts.length === 0) {
          await disconnect();
        } else {
          config.emitter.emit("change", {
            accounts: accounts as readonly Address[],
          });
        }
      },

      async onChainChanged(chainId) {
        // Update the current chain ID when chain changes
        currentChainId = parseInt(chainId, 16);
        config.emitter.emit("change", {
          chainId: currentChainId,
          accounts: await this.getAccounts(),
        });
      },

      async onConnect(connectInfo) {
        // Handle successful connection
        // This is typically called after authentication completes
        void connectInfo;
      },

      async onDisconnect(error) {
        // Handle disconnection
        await disconnect();
        if (error) {
          config.emitter.emit("error", { error });
        }
      },

      // --- Custom methods for Alchemy Auth are defined below this comment ---
      getAuthClient,

      async getAuthSession() {
        await ensureSession();
        return authSessionInstance!;
      },

      setAuthSession,
    };
  });
}
