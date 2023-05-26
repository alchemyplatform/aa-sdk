import "@rainbow-me/rainbowkit/styles.css";

import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";

const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [
    jsonRpcProvider({
      rpc: () => {
        return {
          http: "/api/rpc/proxy",
        };
      },
    }),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
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
