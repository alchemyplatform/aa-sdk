import { SidebarItem } from "vocs";
import { reactNativeSignerSidebar } from "./react-native-signer.js";
import { reactNativeGettingStartedSidebar } from "./getting-started.js";

export const reactNativeSidebar: SidebarItem[] = [
  { text: "Overview", link: "/react-native/overview" },
  { text: "Getting Started", items: reactNativeGettingStartedSidebar },
  { text: "Using the Signer", items: reactNativeSignerSidebar },
];
