import { SidebarItem } from "vocs";

export const aaAccountsSidebar: SidebarItem = {
  text: "aa-accounts",
  collapsed: true,
  items: [
    {
      text: "Getting started",
      link: "/packages/aa-accounts/",
    },
    {
      text: "Light Account",
      link: "/packages/aa-accounts/light-account/",
    },
    {
      text: "Light Account Actions",
      collapsed: true,
      items: [
        {
          text: "transferOwnership",
          link: "/packages/aa-accounts/light-account/actions/transferOwnership",
        },
      ],
    },
    {
      text: "Light Account Client",
      link: "/packages/aa-accounts/light-account/client",
    },
    {
      text: "Utils",
      collapsed: true,
      items: [
        {
          text: "getDefaultLightAccountFactoryAddress",
          link: "/packages/aa-accounts/utils/getDefaultLightAccountFactoryAddress",
        },
      ],
    },
    { text: "Contributing", link: "/packages/aa-accounts/contributing" },
  ],
};
