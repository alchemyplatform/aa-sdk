import { createPublicErc4337Client, mainnet } from "@alchemy/aa-core";

export const client = createPublicErc4337Client({
  chain: mainnet,
  rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/demo",
});
