import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const serverEnv = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    ALCHEMY_KEY: z.string(),
    ALCHEMY_RPC_URL: z.string(),
    ALCHEMY_GAS_MANAGER_POLICY_ID: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: true,
});
