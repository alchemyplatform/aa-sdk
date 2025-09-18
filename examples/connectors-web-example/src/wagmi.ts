import { baseAccount, injected, walletConnect } from '@wagmi/connectors'
import { createConfig, http } from '@wagmi/core'
import { arbitrumSepolia, mainnet, sepolia } from '@wagmi/core/chains'
import { alchemyAuth } from '@alchemy/connectors-web'

export const config = createConfig({
  chains: [arbitrumSepolia, mainnet, sepolia],
  connectors: [
    injected(),
    baseAccount(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
    alchemyAuth({
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    }),
  ],
  // TODO(jh): these transports should use alchemy.
  transports: {
    [arbitrumSepolia.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
