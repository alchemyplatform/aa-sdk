"use client";

import { ToastProvider } from "@/contexts/ToastProvider";
import { AlchemyClientState } from "@account-kit/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense } from "react";
import { ConfigContextProvider, ConfigSync } from "../state";
import { Config, queryClient } from "./config";

export const Providers = (
  props: PropsWithChildren<{
    initialState?: AlchemyClientState;
    initialConfig?: Config;
  }>
) => {
  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ConfigContextProvider
            initialConfig={props.initialConfig}
            initialState={props.initialState}
          >
            <ConfigSync>{props.children}</ConfigSync>
          </ConfigContextProvider>
        </ToastProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
