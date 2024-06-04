"use client";

import { AlchemyAccountProvider } from "@account-kit/react";
import { AlchemyClientState } from "@account-kit/state";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense } from "react";
import { config, queryClient } from "./config";

export const Providers = (
  props: PropsWithChildren<{ initialState?: AlchemyClientState }>
) => {
  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider
          config={config}
          queryClient={queryClient}
          initialState={props.initialState}
        >
          {props.children}
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
