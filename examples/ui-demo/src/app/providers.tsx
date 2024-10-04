"use client";

import { ToastProvider } from "@/contexts/ToastProvider";
import { AlchemyClientState } from "@account-kit/core";
import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense } from "react";
import { alchemyConfig, queryClient } from "./config";
import { ConfigContextProvider } from "./state";

<<<<<<< HEAD
export const Providers = (
  props: PropsWithChildren<{ initialState?: AlchemyClientState }>
) => {
=======
const queryClient = new QueryClient();

const alchemyConfig = createConfig(
  {
    transport: alchemy({ rpcUrl: "/api/rpc" }),
    chain: arbitrumSepolia,
    ssr: true,
    policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
    enablePopupOauth: true,
  },
  {
    illustrationStyle: DEFAULT_CONFIG.ui.illustrationStyle,
    auth: {
      sections: [
        [{ type: "email" as const }],
        [{ type: "passkey" as const }],
        [
          {
            type: "social" as const,
            googleAuth: true,
          },
        ],
      ],
      addPasskeyOnSignup: DEFAULT_CONFIG.auth.addPasskey,
      header: (
        <AuthCardHeader
          theme={DEFAULT_CONFIG.ui.theme}
          logoDark={DEFAULT_CONFIG.ui.logoDark}
          logoLight={DEFAULT_CONFIG.ui.logoLight}
        />
      ),
    },
  }
);

export const Providers = (props: PropsWithChildren<{}>) => {
>>>>>>> cc5f39b0 (feat: authenticate with google, adds lint fixes)
  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider
          config={alchemyConfig}
          queryClient={queryClient}
          initialState={props.initialState}
        >
          <ToastProvider>
            <ConfigContextProvider>{props.children}</ConfigContextProvider>
          </ToastProvider>
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
