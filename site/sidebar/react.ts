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
    text: "Authentication",
    items: [
      { text: "Set up", link: "/react/getting-started" },
      { text: "UI components", link: "/react/ui-components" },
      { text: "Custom UI", link: "/react/react-hooks" },
    ],
  },
  {
    text: "Using smart accounts",
    items: [
      {
        text: "Set up your client",
        link: "/react/how-to-set-up-smart-account-client",
      },
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
    text: "Using EIP-7702",
    link: "/react/using-7702",
  },
  {
    text: "Customizing UI components",
    items: [{ text: "Theme", link: "/react/customization/theme" }],
  },
  {
    text: "Server side rendering",
    link: "/react/ssr",
  },
  { text: "SDK Reference", link: "/reference/account-kit/react" },
];
