import "@rainbow-me/rainbowkit/styles.css";

import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { daappConfigurations } from "~/configs/clientConfigs";

const configuredChains = Object.values(daappConfigurations).map((config) => {
  return config.chain;
});

const { chains, publicClient } = configureChains(configuredChains, [
  jsonRpcProvider({
    rpc: (c) => {
      const http = daappConfigurations[c.id]?.rpcUrl;
      if (!http) {
        throw new Error(`Chain ${c.id} not configured`);
      }
      return {
        http,
      };
    },
  }),
]);

const connectors = connectorsForWallets([
  {
    groupName: "Alchemy DAApp",
    wallets: [injectedWallet({ chains })],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const WalletContext = ({ children }: React.PropsWithChildren) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
};
