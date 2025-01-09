import type { Chain } from "viem";
import { defineChain } from "viem";
import { alchemy } from "@account-kit/infra";

export const mekong: Chain = defineChain({
  id: 7078815900,
  name: "Mekong Pectra Devnet",
  nativeCurrency: { name: "eth", symbol: "eth", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.mekong.ethpandaops.io"],
    },
    alchemy: {
      http: ["https://rpc.mekong.ethpandaops.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://explorer.mekong.ethpandaops.io",
    },
  },
  testnet: true,
});

// const bundlerMethods = [
//     "eth_sendUserOperation",
//     "eth_estimateUserOperationGas",
//     "eth_getUserOperationReceipt",
//     "eth_getUserOperationByHash",
//     "eth_supportedEntryPoints",
//     "rundler_maxPriorityFeePerGas",
//   ];

// export const splitMekongTransport = split({
//   overrides: [
//     {
//       methods: bundlerMethods,
//       transport: http("https://eth-mekong.g.alchemypreview.com/v2/HjEy_lTrJ0P2Y8BRFhAHm_1dVc0svdme"),
//     },
//   ],
//   fallback: http("/api/rpc-mekong"),
// })

export const splitMekongTransport = alchemy({
  alchemyConnection: {
    rpcUrl:
      "https://eth-mekong.g.alchemypreview.com/v2/HjEy_lTrJ0P2Y8BRFhAHm_1dVc0svdme",
  },
  nodeRpcUrl: "/api/rpc-mekong",
});
