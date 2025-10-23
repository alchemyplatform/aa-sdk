"use client";

import { QueryClient } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./config.ts";
import { ReactNode } from "react";
import {
  AlchemyUiProvider,
  type AlchemyAccountsUIConfig,
} from "@alchemy/react";

const queryClient = new QueryClient();

const ui: AlchemyAccountsUIConfig | undefined = {
  illustrationStyle: "flat",
  auth: {
    addPasskeyOnSignup: false,
    header: null,
    hideError: false,
    sections: [
      [
        { type: "email" },
        { type: "social", authProviderId: "google", mode: "popup" },
      ],
    ],
    onAuthSuccess: () => {},
    hideSignInText: false,
  },
  modalBaseClassName: "",
  supportUrl: "",
  uiMode: "modal",
};

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <AlchemyUiProvider queryClient={queryClient} ui={ui}>
        {children}
      </AlchemyUiProvider>
    </WagmiProvider>
  );
};
