import type { Config, Connector } from "wagmi";
import type { AuthClient, Signer } from "@alchemy/signer";

/**
 * Extended connector interface that includes Alchemy Auth-specific methods
 */
export interface AlchemyAuthConnector extends Connector {
  getAuthClient(): AuthClient;
  getSigner(): Promise<Signer>;
  setSigner(signer: Signer): void;
}

/**
 * Helper function to locate and return the Alchemy Auth connector from the config
 *
 * @param {Config} config - The Wagmi config containing connectors
 * @param {string} [id] - The connector ID to search for (defaults to "alchemyAuth")
 * @returns {AlchemyAuthConnector} The Alchemy Auth connector
 * @throws {Error} If the connector is not found
 */
export function resolveAlchemyAuthConnector(
  config: Config,
  id = "alchemyAuth",
): AlchemyAuthConnector {
  const connector = config.connectors.find((c) => c.id === id);
  if (!connector) {
    throw new Error(`Alchemy connector ("${id}") not found`);
  }
  return connector as AlchemyAuthConnector;
}
