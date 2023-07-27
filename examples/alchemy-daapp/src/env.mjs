import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    MUMBAI_ALCHEMY_API_URL: z.string().url(),
    SEPOLIA_ALCHEMY_API_URL: z.string().url(),
    POLYGON_ALCHEMY_API_URL: z.string().url(),
    ARB_ALCHEMY_API_URL: z.string().url(),
    OPT_ALCHEMY_API_URL: z.string().url(),
    OPT_GOERLI_ALCHEMY_API_URL: z.string().url(),
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
    POLYGON_ALCHEMY_API_URL: process.env.POLYGON_ALCHEMY_API_URL,
    ARB_ALCHEMY_API_URL: process.env.ARB_ALCHEMY_API_URL,
    MUMBAI_ALCHEMY_API_URL: process.env.MUMBAI_ALCHEMY_API_URL,
    SEPOLIA_ALCHEMY_API_URL: process.env.SEPOLIA_ALCHEMY_API_URL,
    OPT_ALCHEMY_API_URL: process.env.OPT_ALCHEMY_API_URL,
    OPT_GOERLI_ALCHEMY_API_URL: process.env.OPT_GOERLI_ALCHEMY_API_URL,
  },
});
