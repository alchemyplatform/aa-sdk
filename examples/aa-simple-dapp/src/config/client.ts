import { clientEnv } from "@/env/client.mjs";
import { getDefaultLightAccountFactory } from "@alchemy/aa-accounts";
import { sepolia } from "viem/chains";

export const entryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const lightAccountFactoryAddress =
  getDefaultLightAccountFactory(sepolia);
export const chain = sepolia;
export const isDev = clientEnv.NEXT_PUBLIC_ENV === "development";
export const magicApiKey = clientEnv.NEXT_PUBLIC_MAGIC_API_KEY!;
export const gasManagerPolicyId =
  clientEnv.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID!;
