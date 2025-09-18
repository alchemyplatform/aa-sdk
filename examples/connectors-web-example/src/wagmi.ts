import { baseAccount, injected, walletConnect } from '@wagmi/connectors'
import { createConfig } from '@wagmi/core'
import { arbitrumSepolia, mainnet, sepolia } from '@wagmi/core/chains'
import { alchemyAuth } from '@alchemy/connectors-web'
import {alchemyTransport} from "@alchemy/common"

const transport = alchemyTransport({
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
})

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
  transports: {
    [arbitrumSepolia.id]: transport,
    [mainnet.id]: transport,
    [sepolia.id]: transport,
  },
})
