import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {  AlchemyAccountsConfig, createConfig } from "@account-kit/core";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { PAYMASTER_POLICY_ID, API_KEY } from "@env";
import {  AlchemyAccountProvider, AlchemyAccountsProviderProps } from "@account-kit/react";
import { createContext, useContext } from "react";

const alchemyConfig = createConfig({
  transport: alchemy({ apiKey: API_KEY }),
  chain: arbitrumSepolia,
  // ssr: true,
  policyId: PAYMASTER_POLICY_ID,
});

export type AlchemyAccountContextProps = {
  config: AlchemyAccountsConfig;
  queryClient: QueryClient;
};

export const AlchemyAccountContext = createContext<AlchemyAccountContextProps | undefined>(undefined);

export const useAlchemyAccountContext = () => {
  const context = useContext(AlchemyAccountContext);

  if (context == null) {
    throw new Error("useAlchemyAccountContext must be used within an AlchemyAccountProvider");
  }

  return context;
}

export const AccountkitProvider = (props: React.PropsWithChildren<AlchemyAccountsProviderProps>) => {
  const { children, config, queryClient } = props;

  // console.log("AccountkitConfig", config.store);
  // console.log("config", config.store.getState());
  // console.log("LOcalstorage", localStorage);

  return (
      <AlchemyAccountProvider config={config} queryClient={queryClient} isRN={true}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AlchemyAccountProvider>
  );
};
