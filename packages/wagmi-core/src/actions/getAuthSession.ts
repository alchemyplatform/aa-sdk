import { type Config } from "@wagmi/core";
import type { AuthSession } from "@alchemy/auth";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";

export type GetAuthSessionParameters = void;

export type GetAuthSessionReturnType = AuthSession | null;

/**
 * Gets the current authentication session.
 *
 * **Advanced usage only.** For most use cases, use higher-level actions instead.
 * If you just need user info, use `getUser()` instead.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @returns {AuthSession | null} The current auth session, or null if not authenticated
 */
export function getAuthSession(config: Config): GetAuthSessionReturnType {
  const { connector } = resolveAlchemyAuthConnector(config);
  return connector.getAuthSession();
}
