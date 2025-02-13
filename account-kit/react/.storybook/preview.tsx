import "./tailwind.css";

import { alchemy, sepolia } from "@account-kit/infra";
import type { Preview } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswLoader } from "msw-storybook-addon";
import React, { useEffect } from "react";
import { AlchemyAccountProvider } from "../src/context.js";
import { createConfig } from "../src/index.js";

const queryClient = new QueryClient();

initialize();

const config = createConfig(
  {
    transport: alchemy({ rpcUrl: "/api/rpc" }),
    chain: sepolia,
    ssr: true,
  },
  {
    illustrationStyle: "outline",
    auth: {
      sections: [[{ type: "email" as const }], [{ type: "passkey" as const }]],
      addPasskeyOnSignup: true,
    },
  }
);

const preview: Preview = {
  decorators: [
    (Story, { args }) => {
      // Sync CSS variables
      useEffect(() => {
        const root = document.querySelector(":root") as HTMLElement;
        if (args.isLight === false) {
          root.classList.remove("light");
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
          root.classList.add("light");
        }
      }, [args]);
      return (
        <QueryClientProvider client={queryClient}>
          <AlchemyAccountProvider config={config} queryClient={queryClient}>
            <Story />
          </AlchemyAccountProvider>
        </QueryClientProvider>
      );
    },
  ],
  args: {
    isLight: true,
  },
  loaders: [mswLoader],
  tags: ["autodocs"],
};

export default preview;
