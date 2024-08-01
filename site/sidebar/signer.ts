import { SidebarItem } from "vocs";
import { resources } from "./shared.js";

export const signerSidebar: SidebarItem[] = [
  {
    text: "Overview",
    items: [
      { text: "Introduction", link: "/signer/overview" },
      { text: "Getting started", link: "#TODO" },
    ],
  },
  resources,
];
