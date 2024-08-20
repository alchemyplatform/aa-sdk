import { SidebarItem } from "vocs";
import { sharedSidebar } from "./shared.js";

export const indexSidebar: (
  section?: "react" | "core" | "infra" | "signer" | "contracts"
) => SidebarItem[] = (section) => [
  { text: "Overview", link: "/" },
  { text: "Quickstart", link: "/react/quickstart" },
  ...sharedSidebar(section),
];
