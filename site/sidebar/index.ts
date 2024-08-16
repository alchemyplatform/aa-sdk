import { SidebarItem } from "vocs";
import { sharedSidebar } from "./shared.js";

export const indexSidebar: SidebarItem[] = [
  { text: "Overview", link: "/" },
  { text: "Quickstart", link: "/react/quickstart" },
  ...sharedSidebar,
];
