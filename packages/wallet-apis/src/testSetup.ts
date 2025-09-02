import { alchemyTransport } from "@alchemy/common";

export const ALCHEMY_API_URL = "https://api.g.alchemy.com/v2";

export const apiTransport = alchemyTransport(
  process.env.ALCHEMY_PROXY_RPC_URL
    ? {
        url: process.env.ALCHEMY_PROXY_RPC_URL,
      }
    : {
        url: ALCHEMY_API_URL,
        apiKey: process.env.TEST_ALCHEMY_API_KEY!,
      },
);

export const publicTransport = alchemyTransport(
  process.env.ALCHEMY_PROXY_RPC_URL
    ? {
        url: process.env.ALCHEMY_PROXY_RPC_URL,
      }
    : {
        apiKey: process.env.TEST_ALCHEMY_API_KEY!,
      },
);
