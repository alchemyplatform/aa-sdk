import { DefaultTheme } from "vitepress/types/default-theme";

export const aaAlchemySidebar: DefaultTheme.SidebarItem = {
  text: "aa-alchemy",
  base: "/packages/aa-alchemy",
  collapsed: true,
  items: [
    {
      text: "Getting Started",
      link: "/",
    },
    {
      text: "Smart Account Client",
      link: "/smart-account-client/",
    },
    {
      text: "Smart Account Actions",
      base: "/packages/aa-alchemy/smart-account-client/actions",
      collapsed: true,
      items: [
        {
          text: "simulateUserOperation",
          link: "/simulateUserOperation",
        },
        {
          text: "alchemyEnhancedApiActions",
          link: "/alchemyEnhancedApiActions",
        },
      ],
    },
    {
      text: "Light Account Client",
      link: "/light-account-client/",
    },
    {
      text: "Middleware",
      base: "/packages/aa-alchemy/middleware",
      collapsed: true,
      items: [
        {
          text: "alchemyFeeEstimator",
          link: "/alchemyFeeEstimator",
        },
        {
          text: "alchemyGasManagerMiddleware",
          link: "/alchemyGasManagerMiddleware",
        },
        {
          text: "alchemyUserOperationSimulator",
          link: "/alchemyUserOperationSimulator",
        },
      ],
    },
    {
      text: "Utils",
      collapsed: true,
      base: "/packages/aa-alchemy/utils",
      items: [{ text: "defineAlchemyChain", link: "/defineAlchemyChain" }],
    },
  ],
};
