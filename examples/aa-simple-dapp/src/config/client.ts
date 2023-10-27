import { clientEnv } from "@/env/client.mjs";
import { sepolia } from "viem/chains";

export const chain = sepolia;
export const isDev = clientEnv.NEXT_PUBLIC_ENV === "development";
export const magicApiKey = clientEnv.NEXT_PUBLIC_MAGIC_API_KEY!;
export const gasManagerPolicyId =
  clientEnv.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID!;
