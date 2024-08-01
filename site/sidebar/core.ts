import { SidebarItem } from "vocs";
import { resources } from "./shared.js";

export const coreSidebar: SidebarItem[] = [
  {
    text: "Overview",
    items: [
      { text: "Introduction", link: "/core/overview" },
      { text: "Getting started", link: "#TODO" },
    ],
  },
  resources,
];
