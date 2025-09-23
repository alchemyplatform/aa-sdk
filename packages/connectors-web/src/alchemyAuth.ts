import { createConnector, type Storage } from "@wagmi/core";
import type { CreateConnectorFn } from "wagmi";
import {
  createWebAuthClient,
  type WebAuthClientParams,
} from "@alchemy/auth-web";
import type { AuthClient, AuthSession, AuthSessionState } from "@alchemy/auth";
import { isValidUser } from "@alchemy/auth";
import {
  createWalletClient,
  type Address,
  type Client,
  type EIP1193Provider,
} from "viem";
import { z } from "zod";

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

// Persistence types - minimal, versioned, encrypted snapshot for storage
export type PersistedAuthSessionV1 = AuthSessionState & {
  /** Version for migration handling */
  v: 1;
  /** Chain ID for connector-specific context */
  chainId: number;
};

// Storage configuration
const STORAGE_KEY = "alchemyAuth.authSession" as const;

// Zod schema for validating persisted auth session
const PersistedAuthSessionSchema = z.discriminatedUnion("type", [
  z.object({
    v: z.literal(1),
    type: z.enum(["email", "oauth", "otp"]),
    bundle: z.string(),
    expirationDateMs: z.number(),
    chainId: z.number(),
    user: z.any().refine(isValidUser, "Invalid user object"),
  }),
  z.object({
    v: z.literal(1),
    type: z.literal("passkey"),
    expirationDateMs: z.number(),
    chainId: z.number(),
    user: z.any().refine(isValidUser, "Invalid user object"),
    credentialId: z.string().optional(),
  }),
]);

// Type guard for runtime validation of persisted auth session using Zod
function isPersistedAuthSession(obj: any): obj is PersistedAuthSessionV1 {
  const result = PersistedAuthSessionSchema.safeParse(obj);
  return result.success;
}

// Type-safe storage helpers
async function getStoredAuthSession(
  storage: Storage | null | undefined,
): Promise<PersistedAuthSessionV1 | null> {
  if (!storage) return null;

  try {
    const rawString = await storage.getItem(STORAGE_KEY);

    if (!rawString || typeof rawString !== "string") return null;

    const raw = JSON.parse(rawString);

    if (!isPersistedAuthSession(raw)) {
      // Clean up invalid data
      await storage.removeItem(STORAGE_KEY);
      console.warn("Removed invalid stored session data");
      return null;
    }

    return raw;
  } catch (error) {
    console.warn("Failed to retrieve stored session:", error);
    // Try to clean up potentially corrupted data
    try {
      await storage.removeItem(STORAGE_KEY);
    } catch {}
    return null;
  }
}

async function setStoredAuthSession(
  storage: Storage | null | undefined,
  session: PersistedAuthSessionV1,
): Promise<boolean> {
  if (!storage) return false;

  // Validate before storing
  if (!isPersistedAuthSession(session)) {
    console.error("Attempted to store invalid session data:", session);
    return false;
  }

  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch (error) {
    console.warn("Failed to store session:", error);
    return false;
  }
}

async function clearStoredAuthSession(
  storage: Storage | null | undefined,
): Promise<void> {
  if (!storage) return;

  try {
    await storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear stored session:", error);
  }
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
 * @param {CreateTekStamperFn} [options.createTekStamper] - Optional custom TEK stamper factory for React Native
 * @param {CreateWebAuthnStamperFn} [options.createWebAuthnStamper] - Optional custom WebAuthn stamper factory for passkey authentication
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
  // Cache clients by chainId to avoid recreating them unnecessarily.
  let clients: Record<number, Client> = {};

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

    const emitAndThrowError = (message: string): never => {
      const error = new Error(message);
      config.emitter.emit("error", { error });
      throw error;
    };

    // Silent resume logic to try to restore auth session from storage
    async function tryResume(): Promise<boolean> {
      if (authSessionInstance) return true;

      try {
        const persisted = await getStoredAuthSession(config.storage);
        if (!persisted) return false;

        // Check if session is still valid (not expired)
        if (Date.now() >= persisted.expirationDateMs) {
          await clearStoredAuthSession(config.storage);
          return false;
        }

        // Attempt to restore the auth session
        const client = getAuthClient();
        try {
          const sessionStateJson = JSON.stringify(persisted);
          authSessionInstance =
            await client.loadAuthSessionState(sessionStateJson);

          if (authSessionInstance) {
            currentChainId = persisted.chainId;
            return true;
          } else {
            await config.storage?.removeItem(STORAGE_KEY);
            return false;
          }
        } catch (loadError) {
          await config.storage?.removeItem(STORAGE_KEY);
          return false;
        }
      } catch (error) {
        try {
          await config.storage?.removeItem(STORAGE_KEY);
        } catch {}
        return false;
      }
    }

    function getAuthClient(): AuthClient {
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
    }

    return {
      id: "alchemyAuth",
      name: "Alchemy Auth",
      type: alchemyAuth.type,

      async setup() {
        // Set up cross-tab storage event handling for session synchronization
        // This ensures that when a user logs out in one tab, all other tabs
        // automatically disconnect to prevent stale authentication states
        if (typeof window !== "undefined") {
          const handleStorageChange = (e: StorageEvent) => {
            // The storage event fires when localStorage is modified in other tabs
            // (it doesn't fire in the same tab that made the change)
            if (e.key?.endsWith(STORAGE_KEY) && e.newValue === null) {
              // Our auth session was cleared in another tab - disconnect this tab too
              // This prevents scenarios where Tab A logs out but Tab B stays "connected"
              // with a stale session that would fail on actual usage
              void this.disconnect();
            }
          };

          window.addEventListener("storage", handleStorageChange);
        }
      },

      async connect({ chainId } = {}) {
        // Perform session restoration here if needed
        if (!authSessionInstance) {
          await tryResume();
        }

        if (!authSessionInstance) {
          // TODO(v5): Update error message to reflect different auth methods available.
          emitAndThrowError(
            "No auth session available. Please authenticate first using sendEmailOtp and submitOtpCode, or loginWithOauth.",
          );
        }

        // Refresh persisted snapshot (e.g., new expiration after token refresh)
        try {
          // Get the real auth session state
          const authSessionStateJson =
            authSessionInstance!.getAuthSessionState();
          const authSessionState: AuthSessionState =
            JSON.parse(authSessionStateJson);

          const toPersist: PersistedAuthSessionV1 =
            authSessionState.type === "passkey"
              ? {
                  v: 1,
                  type: "passkey",
                  expirationDateMs: authSessionState.expirationDateMs,
                  chainId: currentChainId || config.chains[0]?.id || 1,
                  user: authSessionState.user,
                  credentialId: authSessionState.credentialId,
                }
              : {
                  v: 1,
                  type: authSessionState.type,
                  bundle: authSessionState.bundle,
                  expirationDateMs: authSessionState.expirationDateMs,
                  chainId: currentChainId || config.chains[0]?.id || 1,
                  user: authSessionState.user,
                };

          const success = await setStoredAuthSession(config.storage, toPersist);
          if (!success) {
            console.warn("Failed to update persisted session during connect");
          }
        } catch (error) {
          console.warn(
            "Failed to update persisted session during connect:",
            error,
          );
          // Don't throw - persistence failure shouldn't break connection
        }

        const accounts = await this.getAccounts();
        if (accounts.length === 0) {
          throw new Error("No accounts available from authSession");
        }

        const resolvedChainId =
          chainId ?? currentChainId ?? config.chains[0]?.id;
        if (!resolvedChainId) {
          emitAndThrowError(
            "No chain ID available. Please provide a chainId parameter or configure chains in your wagmi config.",
          );
        }

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

      async disconnect() {
        try {
          // Clean up instances
          if (authSessionInstance) {
            await authSessionInstance.disconnect();
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

          // Clear persisted storage
          await clearStoredAuthSession(config.storage);
        }
        config.emitter.emit("disconnect");
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
        assertNotNullish(
          resolvedChainId,
          "No chain configured. Please configure chains in your wagmi config.",
        );
        return resolvedChainId;
      },

      async getProvider() {
        assertNotNullish(
          authSessionInstance,
          "No auth session available. Please authenticate first.",
        );
        return authSessionInstance.getProvider();
      },

      // This is optional, but called by `getConnectorClient`. See here: https://github.com/wevm/wagmi/blob/main/packages/core/src/actions/getConnectorClient.ts
      // This enables signing 7702 authorizations, since otherwise wagmi will build a client using the 1193 provider, which is unable to sign authorizations.
      async getClient(params = { chainId: undefined }): Promise<Client> {
        assertNotNullish(
          authSessionInstance,
          "Authentication required. Please configure the alchemyAuth connector with an apiKey.",
        );

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

        const account = authSessionInstance.toViemLocalAccount();

        const client = createWalletClient({
          account,
          transport,
          chain,
        });

        clients[chainId] = client;

        return client;
      },

      async isAuthorized(): Promise<boolean> {
        if (authSessionInstance) return true;

        const stored = await getStoredAuthSession(config.storage);
        return !!stored && Date.now() < stored.expirationDateMs;
      },

      async switchChain({ chainId }) {
        currentChainId = chainId;
        const targetChain = config.chains.find((chain) => chain.id === chainId);
        assertNotNullish(
          targetChain,
          `Chain with id ${chainId} not found in config`,
        );

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

      // --- Custom methods for Alchemy Auth are defined below this comment ---
      getAuthClient,

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

        // Persist session state immediately
        try {
          // Get the real auth session state
          const authSessionStateJson = authSession.getAuthSessionState();
          const authSessionState: AuthSessionState =
            JSON.parse(authSessionStateJson);

          const toPersist: PersistedAuthSessionV1 =
            authSessionState.type === "passkey"
              ? {
                  v: 1,
                  type: "passkey",
                  expirationDateMs: authSessionState.expirationDateMs,
                  chainId: currentChainId || config.chains[0]?.id || 1,
                  user: authSessionState.user,
                  credentialId: authSessionState.credentialId,
                }
              : {
                  v: 1,
                  type: authSessionState.type,
                  bundle: authSessionState.bundle,
                  expirationDateMs: authSessionState.expirationDateMs,
                  chainId: currentChainId || config.chains[0]?.id || 1,
                  user: authSessionState.user,
                };

          void setStoredAuthSession(config.storage, toPersist);
        } catch (error) {
          console.warn("Failed to persist auth session:", error);
          // Don't throw - persistence failure shouldn't break auth flow
        }
      },
    };
  });
}
