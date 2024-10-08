"use client";

import { ToastProvider } from "@/contexts/ToastProvider";
import { AlchemyClientState } from "@account-kit/core";
import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense } from "react";
import { alchemyConfig, queryClient } from "./config";
import { ConfigContextProvider } from "./state";

export const Providers = (
  props: PropsWithChildren<{ initialState?: AlchemyClientState }>
) => {
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
