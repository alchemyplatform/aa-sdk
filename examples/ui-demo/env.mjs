import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    API_KEY: z.string(),
    ALCHEMY_API_URL: z.string().url(),
    ALCHEMY_RPC_URL: z.string().url(),
    ALCHEMY_RPC_URL_ODYSSEY: z.string().url(),
    ALCHEMY_SOLANA_URL: z.string().url(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {},

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    API_KEY: process.env.API_KEY,
    ALCHEMY_API_URL: process.env.ALCHEMY_API_URL,
    ALCHEMY_RPC_URL: process.env.ALCHEMY_RPC_URL,
    ALCHEMY_RPC_URL_ODYSSEY: process.env.ALCHEMY_RPC_URL_ODYSSEY,
    ALCHEMY_SOLANA_URL:
      process.env.ALCHEMY_SOLANA_URL ||
      `https://solana-devnet.g.alchemy.com/v2/${process.env.API_KEY}`,
  },
});
