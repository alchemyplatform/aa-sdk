import { alchemyTransport } from "@alchemy/common";
import { alchemyWalletTransport } from "../transport.js";

export const apiTransport = alchemyWalletTransport(
  process.env.ALCHEMY_PROXY_RPC_URL
    ? {
        url: process.env.ALCHEMY_PROXY_RPC_URL,
      }
    : {
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
