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
    ],
  },
  resources,
];
