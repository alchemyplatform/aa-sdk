import { SidebarItem } from "vocs";
import { concepts, guides, resources } from "./shared.js";

export const indexSidebar: SidebarItem[] = [
  { text: "Overview", link: "/" },
  { text: "Quickstart", link: "/react/quickstart" },
  concepts,
  guides,
  resources,
];
