import {
  Chain,
  polygon,
  polygonMumbai,
  sepolia,
  arbitrum,
  optimism,
  optimismGoerli,
} from "viem/chains";

export interface DAAppConfiguration {
  nftContractAddress: `0x${string}`;
  simpleAccountFactoryAddress: `0x${string}`;
  gasManagerPolicyId: string;
  rpcUrl: string;
  chain: Chain;
}

// TODO: Replace with your own contract addresses and policy ids, feel free to add or remove chains.
export const daappConfigurations: Record<number, DAAppConfiguration> = {
  [polygon.id]: {
    nftContractAddress: "0xb7b9424ef3d1b9086b7e53276c4aad68a1dd971c",
    simpleAccountFactoryAddress: "0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232",
    gasManagerPolicyId: "b888d426-485d-4a0e-be81-7c94ced3d4b1",
    rpcUrl: `/api/rpc/proxy?chainId=${polygon.id}`,
    chain: polygon,
  },
  [polygonMumbai.id]: {
    nftContractAddress: "0x5679b0de84bba361d31b2e7152ab20f0f8565245",
    simpleAccountFactoryAddress: "0x9406Cc6185a346906296840746125a0E44976454",
    gasManagerPolicyId: "469689aa-4fdd-43bd-a721-697f7d5e2c5d",
    rpcUrl: `/api/rpc/proxy?chainId=${polygonMumbai.id}`,
    chain: polygonMumbai,
  },
  [sepolia.id]: {
    nftContractAddress: "0x5679b0de84bba361d31b2e7152ab20f0f8565245",
    simpleAccountFactoryAddress: "0xc8c5736988F4Ea76B9f620dc678c23d5cBf3C83c",
    gasManagerPolicyId: "97ca8953-1692-40ff-9cb8-202accb1416c",
    rpcUrl: `/api/rpc/proxy?chainId=${sepolia.id}`,
    chain: sepolia,
  },
  [arbitrum.id]: {
    nftContractAddress: "0xb7b9424ef3d1b9086b7e53276c4aad68a1dd971c",
    simpleAccountFactoryAddress: "0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232",
    gasManagerPolicyId: "04a10add-f2d6-4f53-93ef-50feec3d7309",
    rpcUrl: `/api/rpc/proxy?chainId=${arbitrum.id}`,
    chain: arbitrum,
  },
  [optimism.id]: {
    nftContractAddress: "0x835629117Abb8cfe20a2e8717C691905A4725b7c",
    simpleAccountFactoryAddress: "0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232",
    gasManagerPolicyId: "6d1bb5b4-d94e-4c8b-9763-6e9c5d5dbbe6",
    rpcUrl: `/api/rpc/proxy?chainId=${optimism.id}`,
    chain: optimism,
  },
  [optimismGoerli.id]: {
    nftContractAddress: "0x835629117Abb8cfe20a2e8717C691905A4725b7c",
    simpleAccountFactoryAddress: "0x9406cc6185a346906296840746125a0e44976454",
    gasManagerPolicyId: "c588e90e-f079-4f89-a2ac-fd01a46f5d14",
    rpcUrl: `/api/rpc/proxy?chainId=${optimismGoerli.id}`,
    chain: optimismGoerli,
  },
};
