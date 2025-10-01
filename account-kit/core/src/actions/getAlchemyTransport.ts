import { alchemy, type AlchemyTransport } from "@account-kit/infra";
import { ChainNotFoundError } from "../errors.js";
import { type AlchemyAccountsConfig } from "../types.js";

export function getAlchemyTransport(
  config: AlchemyAccountsConfig,
): AlchemyTransport {
  const { chain, connections } = config.store.getState();
  if (!connections.has(chain.id)) {
    throw new ChainNotFoundError(chain);
  }
  const connection = connections.get(chain.id)!;

  return alchemy(connection.transport);
}
