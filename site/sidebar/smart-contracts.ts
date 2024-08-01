import { SidebarItem } from "vocs";
import { resources } from "./shared.js";

export const smartContractsSidebar: SidebarItem[] = [
  {
    text: "Overview",
    items: [
      { text: "Introduction", link: "/infra/overview" },
      { text: "Getting started", link: "#TODO" },
    ],
  },
  resources,
];
