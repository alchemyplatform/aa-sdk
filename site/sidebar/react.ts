import { SidebarItem } from "vocs";

export const reactGuides: SidebarItem[] = [
  {
    text: "Overview",
    link: "/react/overview",
  },
  {
    text: "Quickstart",
    link: "/react/quickstart",
  },
  {
    text: "Server side rendering",
    link: "/react/ssr",
  },
  {
    text: "Authentication methods",
    link: "/react/authentication-methods",
  },
  {
    text: "Using smart accounts",
    items: [
      {
        text: "Send user operations",
        link: "/react/send-user-operations",
      },
      { text: "Sponsor gas", link: "/react/sponsor-gas" },
      { text: "Add passkey", link: "/react/add-passkey" },
      { text: "Multi-chain apps", link: "/react/multi-chain-apps" },
    ],
  },
  {
    text: "Customizing UI components",
    items: [
      { text: "Theme", link: "/react/customization/theme" },
      {
        text: "Authentication methods",
        link: "/react/customization/authentication-methods",
      },
    ],
  },
  { text: "SDK Reference", link: "/reference/account-kit/react" },
];
