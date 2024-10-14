"use client";

import { ToastProvider } from "@/contexts/ToastProvider";
import { convertDemoConfigToUiConfig } from "@/state/store";
import { AlchemyClientState } from "@account-kit/core";
import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense } from "react";
import { ConfigContextProvider, ConfigSync } from "../state";
import { alchemyConfig, Config, queryClient } from "./config";

export const Providers = (
  props: PropsWithChildren<{
    initialState?: AlchemyClientState;
    initialConfig?: Config;
  }>
) => {
  const localAlchemyConfig = {
    ...alchemyConfig,
    ui: props.initialConfig
      ? convertDemoConfigToUiConfig(props.initialConfig)
      : alchemyConfig.ui,
  };

  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider
          config={localAlchemyConfig}
          queryClient={queryClient}
          initialState={props.initialState}
        >
          <ToastProvider>
            <ConfigContextProvider
              initialConfig={props.initialConfig}
              initialState={props.initialState}
            >
              <ConfigSync />
              {props.children}
            </ConfigContextProvider>
          </ToastProvider>
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
