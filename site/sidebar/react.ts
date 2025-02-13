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
    text: "Authentication",
    items: [
      { text: "Getting Started", link: "/react/getting-started" },
      { text: "With UI Components", link: "/react/ui-components" },
      { text: "With React Hooks", link: "/react/react-hooks" },
    ],
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
    items: [{ text: "Theme", link: "/react/customization/theme" }],
  },
  { text: "SDK Reference", link: "/reference/account-kit/react" },
];
