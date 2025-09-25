import { baseAccount, injected, walletConnect } from "@wagmi/connectors";
import { Config, createConfig } from "@wagmi/core";
import { arbitrumSepolia, mainnet, sepolia } from "@wagmi/core/chains";
import { alchemyAuth, alchemySmartWallet } from "@alchemy/connectors-web";
import { alchemyTransport } from "@alchemy/common";

const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

const transport = alchemyTransport({ apiKey });

export const config: Config = createConfig({
  chains: [arbitrumSepolia, mainnet, sepolia],
  connectors: [
    alchemySmartWallet({ ownerConnector: alchemyAuth({ apiKey }), apiKey }),
    injected(),
    baseAccount(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: {
    [arbitrumSepolia.id]: transport,
    [mainnet.id]: transport,
    [sepolia.id]: transport,
  },
  multiInjectedProviderDiscovery: false,
});
