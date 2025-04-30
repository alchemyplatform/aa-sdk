"use client";

import { ToastProvider } from "@/contexts/ToastProvider";
import { convertDemoConfigToUiConfig } from "@/state/store";
import { AlchemyClientState } from "@account-kit/core";
import {
  AlchemyAccountProvider,
  AlchemyAccountsConfigWithUI,
} from "@account-kit/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense, useRef } from "react";
import { ConfigContextProvider, ConfigSync } from "../state";
import { alchemyConfig, Config, queryClient } from "./config";

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
              <ConfigSync />
              {props.children}
            </ConfigContextProvider>
          </ToastProvider>
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
