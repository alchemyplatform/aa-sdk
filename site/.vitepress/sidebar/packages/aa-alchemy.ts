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
      text: "Provider",
      base: "/packages/aa-alchemy/provider",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/introduction",
        },
        {
          text: "constructor",
          link: "/constructor",
        },
        {
          text: "factory",
          link: "/light-account-factory",
        },
        { text: "gasEstimator", link: "/gasEstimator" },
        {
          text: "simulateUserOperationAssetChanges",
          link: "/simulateUserOperationAssetChanges",
        },
        {
          text: "withAlchemyGasManager",
          link: "/withAlchemyGasManager",
        },
        {
          text: "withAlchemyUserOpSimulation",
          link: "/withAlchemyUserOpSimulation",
        },
        {
          text: "withAlchemyEnhancedApis",
          link: "/withAlchemyEnhancedApis",
        },
      ],
    },
    {
      text: "Middleware",
      base: "/packages/aa-alchemy/middleware",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/introduction",
        },
        {
          text: "withAlchemyGasFeeEstimator",
          link: "/withAlchemyGasFeeEstimator",
        },
        {
          text: "withAlchemyGasManager",
          link: "/withAlchemyGasManager",
        },
        {
          text: "withAlchemyUserOpSimulation",
          link: "/withAlchemyUserOpSimulation",
        },
      ],
    },
    {
      text: "Utils",
      collapsed: true,
      base: "/packages/aa-alchemy/utils",
      items: [
        {
          text: "Introduction",
          link: "/introduction",
        },
        { text: "SupportedChains", link: "/supportedChains" },
      ],
    },
  ],
};
