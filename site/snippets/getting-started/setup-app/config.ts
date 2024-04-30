import { cookieStorage, createConfig } from "@alchemy/aa-alchemy/config";
import { arbitrumSepolia } from "@alchemy/aa-core";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
export const config = createConfig({
  rpcUrl: "/api/rpc", // this will proxy requests through the app's backend via NextJS routing to hide the Alchemy API key
  chain: arbitrumSepolia,
  // because we're using NextJS which is SSR, we need the following settings
  ssr: true,
  // This will allow us to persist user state to cookies, making a smoother user experience
  // not required in non SSR settings
  storage: cookieStorage,
});
