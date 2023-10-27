import { createPublicErc4337Client } from "@alchemy/aa-core";
import { mainnet } from "viem/chains";
export const client = createPublicErc4337Client({
    chain: mainnet,
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/demo",
});
