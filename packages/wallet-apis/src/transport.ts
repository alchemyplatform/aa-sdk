import { alchemyTransport, type AlchemyTransportConfig } from "@alchemy/common";

// TODO(jh): add jsdoc for this & update other docs examples to use this instead of alchemyTransport directly.
export const alchemyWalletTransport = (config: AlchemyTransportConfig) => {
  return alchemyTransport({ ...config, url: "https://api.g.alchemy.com" });
};
