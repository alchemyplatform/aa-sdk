import type { Config, Connector } from "wagmi";
import type { AuthClient, AuthSession } from "@alchemy/auth";
import { connect, getConnectors, type ConnectReturnType } from "@wagmi/core";

export const ALCHEMY_AUTH_CONNECTOR_TYPE = "alchemy-auth";
export const ALCHEMY_SMART_WALLET_CONNECTOR_TYPE = "alchemy-smart-wallet";

/**
 * Extended connector interface that includes Alchemy Auth-specific methods
 */
export interface AlchemyAuthConnector extends Connector {
  getAuthClient(): AuthClient;
  getAuthSession(): AuthSession | null;
  setAuthSession(authSession: AuthSession): void;
}

export interface ResolvedAuthConnector {
  connector: AlchemyAuthConnector;
  connectAlchemyAuth: () => Promise<ConnectReturnType<Config>>;
}

/**
 * Helper function to locate and return the Alchemy Auth connector from the
 * config, as well as a function to connect to it which is compatible with
 * the Alchemy Smart Wallet connector if wrapped.
 *
 * @param {Config} config - The Wagmi config containing connectors
 * @returns {ResolvedAuthConnector} The Alchemy Auth connector and a function to connect to it
 * @throws {Error} If the connector is not found
 */
export function resolveAlchemyAuthConnector(
  config: Config,
): ResolvedAuthConnector {
  const connectors = getConnectors(config);
  for (const connector of connectors) {
    if (connector.type === ALCHEMY_AUTH_CONNECTOR_TYPE) {
      return {
        connector: connector as AlchemyAuthConnector,
        connectAlchemyAuth: () => connect(config, { connector }),
      };
    } else if (connector.type === ALCHEMY_SMART_WALLET_CONNECTOR_TYPE) {
      const ownerConnector: Connector = (connector as any).ownerConnector;
      if (ownerConnector.type === ALCHEMY_AUTH_CONNECTOR_TYPE) {
        return {
          connector: ownerConnector as AlchemyAuthConnector,
          connectAlchemyAuth: () => connect(config, { connector }),
        };
      }
    }
  }
  throw new Error(`Alchemy Auth connector not found`);
}
