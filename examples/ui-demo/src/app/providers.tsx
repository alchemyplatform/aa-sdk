"use client";

import { ToastProvider } from "@/contexts/ToastProvider";
import { convertDemoConfigToUiConfig } from "@/state/store";
import { AlchemyClientState } from "@account-kit/core";
import {
  AlchemyAccountProvider,
  AlchemyAccountsConfigWithUI,
  AlchemySolanaWeb3Context,
} from "@account-kit/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense, useMemo, useRef } from "react";
import { ConfigContextProvider, ConfigSync } from "../state";
import { alchemyConfig, Config, queryClient } from "./config";
import { Connection } from "@solana/web3.js";

export const Providers = (
  props: PropsWithChildren<{
    initialState?: AlchemyClientState;
    initialConfig?: Config;
  }>
) => {
  const configRef = useRef<AlchemyAccountsConfigWithUI>();

  if (!configRef.current) {
    configRef.current = (() => {
      const innerConfig = alchemyConfig();
      return {
        ...innerConfig,
        ui: props.initialConfig
          ? convertDemoConfigToUiConfig(props.initialConfig)
          : innerConfig.ui,
      };
    })();
  }
  const connection = new Connection(
    `${
      (global || window)?.location?.origin || "http://localhost:3000"
    }/api/rpc/solana`,
    {
      wsEndpoint: "wss://api.devnet.solana.com",
      commitment: "confirmed",
    }
  );
  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider
          config={configRef.current}
          queryClient={queryClient}
          initialState={props.initialState}
        >
          <ToastProvider>
            <ConfigContextProvider
              initialConfig={props.initialConfig}
              initialState={props.initialState}
            >
              <AlchemySolanaWeb3Context.Provider
                value={{
                  connection: connection,
                  policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
                }}
              >
                <ConfigSync />
                {props.children}
              </AlchemySolanaWeb3Context.Provider>
            </ConfigContextProvider>
          </ToastProvider>
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
