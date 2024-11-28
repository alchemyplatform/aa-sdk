import { SidebarItem } from "vocs";
import { reactNativeSignerSidebar } from "./react-native-signer.js";

export const reactNativeSidebar: SidebarItem[] = [
  { text: "Overview", link: "/react-native/overview" },
  { text: "Getting Started", link: "/react-native/getting-started" },
  { text: "React Native Signer", items: reactNativeSignerSidebar },
];
