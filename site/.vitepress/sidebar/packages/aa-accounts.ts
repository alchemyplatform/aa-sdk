import { DefaultTheme } from "vitepress/types/default-theme";

export const aaAccountsSidebar: DefaultTheme.SidebarItem = {
  text: "aa-accounts",
  collapsed: true,
  base: "/packages/aa-accounts",
  items: [
    {
      text: "Getting Started",
      link: "/",
    },
    {
      text: "Light Account",
      link: "/light-account/",
    },
    {
      text: "Light Account Actions",
      collapsed: true,
      base: "/packages/aa-accounts/light-account/actions",
      items: [
        {
          text: "transferOwnership",
          link: "/transferOwnership",
        },
      ],
    },
    {
      text: "Light Account Client",
      link: "/light-account/client",
    },
    {
      text: "Utils",
      collapsed: true,
      base: "/packages/aa-accounts/utils",
      items: [
        {
          text: "getDefaultLightAccountFactoryAddress",
          link: "/getDefaultLightAccountFactoryAddress",
        },
      ],
    },
    { text: "Contributing", link: "/contributing" },
  ],
};
