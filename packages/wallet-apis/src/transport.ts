import {
  alchemyTransport,
  type AlchemyTransport,
  type AlchemyTransportConfig,
} from "@alchemy/common";

export type AlchemyWalletTransport = AlchemyTransport;

export const alchemyWalletTransport = (
  config: AlchemyTransportConfig,
): AlchemyWalletTransport => {
  return alchemyTransport({ ...config, url: "https://api.g.alchemy.com" });
};
