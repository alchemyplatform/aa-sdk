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
      collapsed: true,
      base: "/packages/aa-accounts/light-account",
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
          text: "provider",
          link: "/provider",
        },
        {
          text: "signMessageWith6492",
          link: "/signMessageWith6492",
        },
        { text: "signTypedData", link: "/signTypedData" },
        {
          text: "signTypedDataWith6492",
          link: "/signTypedDataWith6492",
        },
        { text: "getOwnerAddress", link: "/getOwnerAddress" },
        {
          text: "encodeTransferOwnership",
          link: "/encodeTransferOwnership",
        },
        { text: "transferOwnership", link: "/transferOwnership" },
      ],
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
