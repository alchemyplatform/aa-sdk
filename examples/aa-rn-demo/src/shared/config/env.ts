import Config from "react-native-config";

import { getDefaultLightAccountFactory } from "@alchemy/aa-accounts";
import { type Hex } from "viem";
import { goerli } from "viem/chains";

export const chain = goerli;
export const entryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const lightAccountFactoryAddress = getDefaultLightAccountFactory(chain);

export const isDev = Config.NODE_ENV === "development";
export const gasManagerPolicyId = Config.ALCHEMY_GAS_MANAGER_POLICY_ID!;
export const alchemyRpcUrl = `${Config.ALCHEMY_RPC_URL}${Config.ALCHEMY_KEY}`;

export const privateKey: Hex = Config.PRIVATE_KEY! as Hex;
