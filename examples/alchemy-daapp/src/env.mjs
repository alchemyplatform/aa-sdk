import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

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
    BASE_ALCHEMY_API_URL: z.string().url(),
    BASE_GOERLI_ALCHEMY_API_URL: z.string().url(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_OPT_GOERLI_POLICY_ID: z.string(),
    NEXT_PUBLIC_OPT_POLICY_ID: z.string(),
    NEXT_PUBLIC_ARB_POLICY_ID: z.string(),
    NEXT_PUBLIC_POLYGON_POLICY_ID: z.string(),
    NEXT_PUBLIC_SEPOLIA_POLICY_ID: z.string(),
    NEXT_PUBLIC_MUMBAI_POLICY_ID: z.string(),
    NEXT_PUBLIC_BASE_POLICY_ID: z.string(),
    NEXT_PUBLIC_BASE_GOERLI_POLICY_ID: z.string(),
  },

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
    BASE_ALCHEMY_API_URL: process.env.BASE_ALCHEMY_API_URL,
    BASE_GOERLI_ALCHEMY_API_URL: process.env.BASE_GOERLI_ALCHEMY_API_URL,
    NEXT_PUBLIC_OPT_GOERLI_POLICY_ID: process.env.NEXT_PUBLIC_OPT_GOERLI_POLICY_ID,
    NEXT_PUBLIC_OPT_POLICY_ID: process.env.NEXT_PUBLIC_OPT_POLICY_ID,
    NEXT_PUBLIC_ARB_POLICY_ID: process.env.NEXT_PUBLIC_ARB_POLICY_ID,
    NEXT_PUBLIC_POLYGON_POLICY_ID: process.env.NEXT_PUBLIC_POLYGON_POLICY_ID,
    NEXT_PUBLIC_SEPOLIA_POLICY_ID: process.env.NEXT_PUBLIC_SEPOLIA_POLICY_ID,
    NEXT_PUBLIC_MUMBAI_POLICY_ID: process.env.NEXT_PUBLIC_MUMBAI_POLICY_ID,
    NEXT_PUBLIC_BASE_POLICY_ID: process.env.NEXT_PUBLIC_BASE_POLICY_ID,
    NEXT_PUBLIC_BASE_GOERLI_POLICY_ID: process.env.NEXT_PUBLIC_BASE_GOERLI_POLICY_ID,
  },
});
