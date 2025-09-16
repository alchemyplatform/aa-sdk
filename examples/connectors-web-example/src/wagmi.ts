import { baseAccount, injected, walletConnect } from '@wagmi/connectors'
import { Config, createConfig, http } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'
import { alchemyAuth } from '@alchemy/connectors-web'

export const config: Config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    baseAccount(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
    alchemyAuth({
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
