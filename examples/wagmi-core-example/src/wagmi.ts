import { baseAccount, injected, walletConnect } from "@wagmi/connectors";
import { Config, createConfig } from "@wagmi/core";
import { arbitrumSepolia, mainnet, sepolia } from "@wagmi/core/chains";
import { alchemySmartWallet } from "@alchemy/wagmi-core";
import { alchemyTransport } from "@alchemy/common";

const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

const transport = alchemyTransport({ apiKey });

export const config: Config = createConfig({
  chains: [arbitrumSepolia, mainnet, sepolia],
  connectors: [
    // Smart Wallet wraps the owner connector (injected). Pass the connector factory, not an instance.
    alchemySmartWallet({
      ownerConnector: injected,
      apiKey,
      policyId: import.meta.env.VITE_PAYMASTER_POLICY_ID,
    }),
    // Optionally expose the owner connector on its own as well.
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
