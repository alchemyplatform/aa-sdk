import { DefaultTheme } from "vitepress/types/default-theme";

export const aaAccountsSidebar: DefaultTheme.SidebarItem = {
  text: "aa-accounts",
  collapsed: true,
  base: "/packages/aa-accounts",
  items: [
    {
      text: "Getting started",
      link: "/",
    },
    {
      text: "Accounts",
      collapsed: true,
      base: "/packages/aa-accounts/accounts/",
      items: [
        {
          text: "Modular Account",
          link: "/modular-account",
        },
        {
          text: "Light Account",
          link: "/light-account",
        },
      ],
    },
    {
      text: "Clients",
      collapsed: true,
      base: "/packages/aa-accounts/clients/",
      items: [
        {
          text: "Modular Account Client",
          link: "/modular-account",
        },
        {
          text: "Light Account Client",
          link: "/light-account",
        },
      ],
    },
    {
      text: "Actions",
      collapsed: true,
      base: "/packages/aa-accounts/actions",
      items: [
        {
          text: "accountLoupeActions",
          link: "/accountLoupeActions",
        },
        {
          text: "pluginManagerActions",
          link: "/pluginManagerActions",
        },
        {
          text: "lightAccountClientActions",
          link: "/lightAccountClientActions",
        },
      ],
    },
    {
      text: "Multi Owner Plugin",
      collapsed: true,
      base: "/packages/aa-accounts/multi-owner",
      items: [
        {
          text: "Getting Started",
          link: "/",
        },
        {
          text: "Actions",
          link: "/actions",
        },
        {
          text: "Signer",
          link: "/signer",
        },
      ],
    },
    {
      text: "Session Key Plugin",
      collapsed: true,
      base: "/packages/aa-accounts/session-key",
      items: [
        {
          text: "Getting Started",
          link: "/",
        },
        {
          text: "Actions",
          link: "/actions",
        },
        {
          text: "Permissions",
          link: "/permissions",
        },
        {
          text: "Signer",
          link: "/signer",
        },
      ],
    },
    {
      text: "Utils",
      collapsed: true,
      base: "/packages/aa-accounts/utils",
      items: [
        {
          text: "getDefaultMultiOwnerModularAccountFactoryAddress",
          link: "/getDefaultMultiOwnerModularAccountFactoryAddress",
        },
        {
          text: "getMSCAUpgradeToData",
          link: "/getMSCAUpgradeToData",
        },
        {
          text: "getDefaultLightAccountFactoryAddress",
          link: "/getDefaultLightAccountFactoryAddress",
        },
      ],
    },
    { text: "Contributing", link: "/contributing" },
  ],
};
