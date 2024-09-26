import type { AlchemyTransport } from "@account-kit/infra";
import type { AlchemyAccountsConfig } from "../types";

export function getAlchemyTransport(
  config: AlchemyAccountsConfig
): AlchemyTransport {
  return config.store.getState().transport;
}
