import { SidebarItem } from "vocs";
import { resources } from "./shared.js";

export const infraSidebar: SidebarItem[] = [
  { text: "Overview", link: "/infra/overview" },
  { text: "Quickstart", link: "/infra/quickstart" },
  {
    text: "Using smart accounts",
    items: [
      {
        text: "Send user operations",
        link: "/infra/send-user-operations",
      },
      {
        text: "Sponsor gas",
        link: "/infra/sponsor-gas",
      },
      {
        text: "Retry user operations",
        link: "/infra/drop-and-replace",
      },
    ],
  },
  { text: "SDK Reference", link: "/reference/account-kit/infra" },
  resources,
];
