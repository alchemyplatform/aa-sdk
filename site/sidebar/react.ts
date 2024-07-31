import { SidebarItem } from "vocs";
import { resources } from "./shared.js";

export const reactSidebar: SidebarItem[] = [
  {
    text: "Overview",
    link: "/react/overview",
  },
  {
    text: "Quickstart",
    link: "/react/quickstart",
  },
  {
    text: "Using smart accounts",
    items: [
      {
        text: "Authenticate users",
        link: "/react/authenticate-users",
      },
      {
        text: "Send user operations",
        link: "#TODO/react/send-user-operations",
      },
      {
        text: "Batch user operations",
        link: "#TODO/react/batch-user-operations",
      },
      { text: "Sponsor gas", link: "#TODO/react/sponsor-gas" },
      { text: "Add passkey", link: "#TODO/react/add-passkey" },
      { text: "Multi-chain apps", link: "#TODO/react/multi-chain-apps" },
    ],
  },
  { text: "SDK Reference", link: "/reference/account-kit/react" },
  resources,
];
