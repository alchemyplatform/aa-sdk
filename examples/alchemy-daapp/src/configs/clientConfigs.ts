import {
  Chain,
  arbitrum,
  base,
  baseGoerli,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  sepolia,
} from "viem/chains";
import { env } from "~/env.mjs";

export interface DAAppConfiguration {
  nftContractAddress: `0x${string}`;
  gasManagerPolicyId: string;
  rpcUrl: string;
  chain: Chain;
}

// TODO: Replace with your own contract addresses and policy ids, feel free to add or remove chains.
export const daappConfigurations: Record<number, DAAppConfiguration> = {
  [polygon.id]: {
    nftContractAddress: "0xb7b9424ef3d1b9086b7e53276c4aad68a1dd971c",
    gasManagerPolicyId: env.NEXT_PUBLIC_POLYGON_POLICY_ID,
    rpcUrl: `/api/rpc/proxy?chainId=${polygon.id}`,
    chain: polygon,
  },
  [polygonMumbai.id]: {
    nftContractAddress: "0x5679b0de84bba361d31b2e7152ab20f0f8565245",
    gasManagerPolicyId: env.NEXT_PUBLIC_MUMBAI_POLICY_ID,
    rpcUrl: `/api/rpc/proxy?chainId=${polygonMumbai.id}`,
    chain: polygonMumbai,
  },
  [sepolia.id]: {
    nftContractAddress: "0x5679b0de84bba361d31b2e7152ab20f0f8565245",
    gasManagerPolicyId: env.NEXT_PUBLIC_SEPOLIA_POLICY_ID,
    rpcUrl: `/api/rpc/proxy?chainId=${sepolia.id}`,
    chain: sepolia,
  },
  [arbitrum.id]: {
    nftContractAddress: "0xb7b9424ef3d1b9086b7e53276c4aad68a1dd971c",
    gasManagerPolicyId: env.NEXT_PUBLIC_ARB_POLICY_ID,
    rpcUrl: `/api/rpc/proxy?chainId=${arbitrum.id}`,
    chain: arbitrum,
  },
  [optimism.id]: {
    nftContractAddress: "0x835629117Abb8cfe20a2e8717C691905A4725b7c",
    gasManagerPolicyId: env.NEXT_PUBLIC_OPT_POLICY_ID,
    rpcUrl: `/api/rpc/proxy?chainId=${optimism.id}`,
    chain: optimism,
  },
  [optimismGoerli.id]: {
    nftContractAddress: "0x835629117Abb8cfe20a2e8717C691905A4725b7c",
    gasManagerPolicyId: env.NEXT_PUBLIC_OPT_GOERLI_POLICY_ID,
    rpcUrl: `/api/rpc/proxy?chainId=${optimismGoerli.id}`,
    chain: optimismGoerli,
  },
  [base.id]: {
    nftContractAddress: "0x835629117Abb8cfe20a2e8717C691905A4725b7c",
    gasManagerPolicyId: env.NEXT_PUBLIC_BASE_POLICY_ID,
    rpcUrl: `/api/rpc/proxy?chainId=${base.id}`,
    chain: base,
  },
  [baseGoerli.id]: {
    nftContractAddress: "0x835629117Abb8cfe20a2e8717C691905A4725b7c",
    gasManagerPolicyId: env.NEXT_PUBLIC_BASE_GOERLI_POLICY_ID,
    rpcUrl: `/api/rpc/proxy?chainId=${baseGoerli.id}`,
    chain: baseGoerli,
  },
};
