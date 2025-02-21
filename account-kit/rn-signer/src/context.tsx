import "./utils/polyfills/buffer-polyfill.js";
import "./utils/polyfills/mmkv-localstorage-polyfill.js";
import "./utils/polyfills/custom-event.js";
import "./utils/polyfills/window.js";

import { QueryClient } from "@tanstack/react-query";
import {
  createConfig,
  type CreateConfigProps,
  hydrate,
} from "@account-kit/core";
import { useRef } from "react";
import { AlchemyAccountProvider } from "@account-kit/react";
import { type RNAlchemySignerType } from "./signer.js";

export type AlchemyAccountsProviderProps = {
  configParams: CreateConfigProps & { signer: RNAlchemySignerType };
  queryClient: QueryClient;
};

/**
 * React Native specific Provider for Alchemy Accounts.
 * Wraps the AccountKitProvider from `account-kit/react`
 *
 * @example
 * ```tsx
 * import { AlchemyAccountProvider, createConfig } from "@account-kit/react-native-signer";
 * import { sepolia } from "@account-kit/infra";
 * import { QueryClient } from "@tanstack/react-query";
 *
 * const config = createConfig({
 *  apiKey: "your-api-key",
 *  chain: sepolia,
 * });
 *
 * const queryClient = new QueryClient();
 *
 * function App({ children }: React.PropsWithChildren) {
 *  return (
 *    <QueryClientProvider queryClient={queryClient}>
 *      <AlchemyAccountProvider config={config} queryClient={queryClient}>
 *        {children}
 *      </AlchemyAccountProvider>
 *    </QueryClientProvider>
 *  );
 * }
 * ```
 *
 * @param {React.PropsWithChildren<AlchemyAccountsProviderProps>} props alchemy accounts provider props
 * @param {AlchemyAccountsConfig} props.config the acccount config generated using `createConfig`
 * @param {QueryClient} props.queryClient the react-query query client to use
 * @param {AlchemyAccountsUIConfig} props.uiConfig optional UI configuration
 * @param {React.ReactNode | undefined} props.children react components that should have this accounts context
 * @returns {React.JSX.Element} The element to wrap your application in for Alchemy Accounts context.
 */

export const AccountkitProvider = (
  props: React.PropsWithChildren<AlchemyAccountsProviderProps>
) => {
  const { children, configParams, queryClient } = props;

  const hasHydrated = useRef(false);

  const signer = configParams.signer;

  if (!signer) {
    throw new Error("Please pass a valid signerConnection config");
  }

  const alchemyConfig = createConfig({
    ...configParams,
    overrideSigner: signer,
  });

  const { onMount } = hydrate(alchemyConfig);

  if (!hasHydrated.current) {
    onMount();
    hasHydrated.current = true;
  }

  return (
    <AlchemyAccountProvider
      config={alchemyConfig}
      queryClient={queryClient}
      isRN={true}
    >
      {children}
    </AlchemyAccountProvider>
  );
};
