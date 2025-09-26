"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlchemyProvider } from "@alchemy/react";
import { config } from "./config.ts";
import { ReactNode } from "react";

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AlchemyProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AlchemyProvider>
  );
};
