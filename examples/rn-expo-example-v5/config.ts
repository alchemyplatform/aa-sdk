import { createConfig, http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
  // TODO(v5): this obviously doesn't work in react native. wagmi
  // automatically disables it if `window` is undefined, but seems
  // there's another pkg in the expo react native quickstart that
  // polyfills window already.
  multiInjectedProviderDiscovery: false,
});
