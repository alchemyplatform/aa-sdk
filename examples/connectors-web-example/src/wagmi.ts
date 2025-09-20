import { baseAccount, injected, walletConnect } from '@wagmi/connectors'
import { Config, createConfig, http } from '@wagmi/core'
import { arbitrumSepolia, mainnet, sepolia } from '@wagmi/core/chains'
import { alchemyAuth } from '@alchemy/connectors-web'

export const config: Config = createConfig({
  chains: [arbitrumSepolia, mainnet, sepolia],
  connectors: [
    injected(),
    baseAccount(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
    alchemyAuth({
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    }),
  ],
  transports: {
    [arbitrumSepolia.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
