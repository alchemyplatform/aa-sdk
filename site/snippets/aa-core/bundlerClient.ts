import { createBundlerClient, mainnet } from "@aa-sdk/core";
import { http } from "viem";

export const client = createBundlerClient({
  chain: mainnet,
  transport: http("https://eth-mainnet.g.alchemy.com/v2/demo"),
});
