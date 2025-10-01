import type { Storage } from "@wagmi/core";
import { z } from "zod";

/**
 * Persisted authentication session data stored in Wagmi storage.
 * The auth session state is treated as an opaque serialized blob,
 * with its contents managed by the auth package.
 */
export type PersistedAuthSession = {
  /** Version for migration handling */
  version: 1;
  /** Chain ID for connector-specific context */
  chainId: number;
  /** Opaque serialized auth session state - contents managed by auth package */
  authSessionState: string;
};

// Storage configuration
const STORAGE_KEY = "alchemyAuth.authSession" as const;

// Minimal schema for validating persisted auth session structure
const PersistedAuthSessionSchema = z.object({
  version: z.literal(1),
  chainId: z.number(),
  authSessionState: z.string(),
});

// Type guard for runtime validation of persisted auth session
function isPersistedAuthSession(obj: unknown): obj is PersistedAuthSession {
  const result = PersistedAuthSessionSchema.safeParse(obj);
  return result.success;
}

/**
 * Retrieves the persisted auth session from Wagmi storage.
 * Validates the stored data structure and automatically cleans up invalid data.
 *
 * @param {Storage | null | undefined} storage - Wagmi storage instance
 * @returns {Promise<PersistedAuthSession | null>} The persisted session if valid, otherwise null
 */
export async function getStoredAuthSession(
  storage: Storage | null | undefined,
): Promise<PersistedAuthSession | null> {
  if (!storage) {
    return null;
  }

  try {
    const rawString = await storage.getItem(STORAGE_KEY);

    if (!rawString || typeof rawString !== "string") {
      return null;
    }

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

/**
 * Persists an auth session to Wagmi storage.
 * Validates the session data structure before storing.
 *
 * @param {Storage | null | undefined} storage - Wagmi storage instance
 * @param {PersistedAuthSession} session - The session data to persist
 * @returns {Promise<boolean>} True if successfully stored, false otherwise
 */
export async function setStoredAuthSession(
  storage: Storage | null | undefined,
  session: PersistedAuthSession,
): Promise<boolean> {
  if (!storage) {
    return false;
  }

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

/**
 * Clears the persisted auth session from Wagmi storage.
 * Called during logout or when session restoration fails.
 *
 * @param {Storage | null | undefined} storage - Wagmi storage instance
 * @returns {Promise<void>}
 */
export async function clearStoredAuthSession(
  storage: Storage | null | undefined,
): Promise<void> {
  if (!storage) return;

  try {
    await storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear stored session:", error);
  }
}

/**
 * Gets the storage key used for cross-tab synchronization.
 * This allows multiple connectors to listen for changes to the same storage key.
 *
 * @returns {string} The storage key used by connectors
 */
export function getAuthStorageKey(): string {
  return STORAGE_KEY;
}
