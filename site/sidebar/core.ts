import { SidebarItem } from "vocs";

export const coreSidebar: SidebarItem[] = [
  { text: "Overview", link: "/core/overview" },
  { text: "Quickstart", link: "/core/quickstart" },
  { text: "Server side rendering", link: "/core/ssr" },
  {
    text: "Using smart accounts",
    items: [
      {
        text: "Send user operations",
        link: "/core/send-user-operations",
      },
      { text: "Sponsor gas", link: "/core/sponsor-gas" },
      { text: "Add passkey", link: "/core/add-passkey" },
      { text: "Multi-chain apps", link: "/core/multi-chain-apps" },
    ],
  },
  { text: "SDK Reference", link: "/reference/account-kit/core" },
];
