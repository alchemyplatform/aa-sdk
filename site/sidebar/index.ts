import { SidebarItem } from "vocs";
import { concepts, sharedSidebar } from "./shared.js";

export const indexSidebar: (
  section?: "react" | "core" | "infra" | "signer" | "contracts" | "react-native"
) => SidebarItem[] = (section) => [intro, ...sharedSidebar(section)];

export const intro: SidebarItem = {
  text: "Introduction",
  items: [
    { text: "Overview", link: "/" },
    { text: "Quickstart", link: "/react/quickstart" },
    { text: "Demo", link: "https://demo.alchemy.com/" },
    concepts,
  ],
};
