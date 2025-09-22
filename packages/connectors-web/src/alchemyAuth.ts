import { createConnector, type Storage } from "@wagmi/core";
import type { CreateConnectorFn } from "wagmi";
import {
  createWebAuthClient,
  type WebAuthClientParams,
} from "@alchemy/auth-web";
import type { AuthClient, AuthSession, AuthSessionState } from "@alchemy/auth";
import { isValidUser } from "@alchemy/auth";
import { type Address, type EIP1193Provider } from "viem";
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
async function getStoredSession(
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

async function setStoredSession(
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

async function clearStoredSession(
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

  return createConnector<Provider, Properties>((config) => {
    const emitAndThrowError = (message: string): never => {
      const error = new Error(message);
      config.emitter.emit("error", { error });
      throw error;
    };

    // Silent resume logic - attempts to restore session from storage
    async function tryResume(): Promise<boolean> {
      if (authSessionInstance) return true;

      try {
        const persisted = await getStoredSession(config.storage);
        if (!persisted) return false;

        // Check if session is still valid (not expired)
        if (Date.now() >= persisted.expirationDateMs) {
          await clearStoredSession(config.storage);
          return false;
        }

        // Get auth client
        const client = getAuthClient();

        // Attempt to restore the auth session
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
        // Clean up on any error
        try {
          await config.storage?.removeItem(STORAGE_KEY);
        } catch {}
        return false;
      }
    }

    // Helper to get auth client with mock methods attached
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
        if (typeof window !== "undefined") {
          const handleStorageChange = (e: StorageEvent) => {
            // Check if our auth session storage key was modified
            if (e.key?.endsWith(STORAGE_KEY) && e.newValue === null) {
              // Storage was cleared in another tab - disconnect this tab too
              console.log(
                "Auth session cleared in another tab, disconnecting...",
              );
              void this.disconnect();
            }
          };

          window.addEventListener("storage", handleStorageChange);

          // Store cleanup function for potential future use
          // (wagmi doesn't currently call a cleanup method on connectors)
          if (!(window as any).__alchemyAuthStorageCleanup) {
            (window as any).__alchemyAuthStorageCleanup = () => {
              window.removeEventListener("storage", handleStorageChange);
            };
          }
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
            "No signer available. Please authenticate first using sendEmailOtp and submitOtpCode, or loginWithOauth.",
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

          const success = await setStoredSession(config.storage, toPersist);
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

          // Clear persisted storage
          await clearStoredSession(config.storage);
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

      async getProvider() {
        if (!authSessionInstance) {
          throw new Error(
            "No auth session available. Please authenticate first.",
          );
        }
        return authSessionInstance.getProvider();
      },

      async isAuthorized(): Promise<boolean> {
        // Fast check - no heavy operations
        if (authSessionInstance) return true;

        const stored = await getStoredSession(config.storage);
        return !!stored && Date.now() < stored.expirationDateMs;
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

          void setStoredSession(config.storage, toPersist);
        } catch (error) {
          console.warn("Failed to persist auth session:", error);
          // Don't throw - persistence failure shouldn't break auth flow
        }
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
