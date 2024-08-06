import { SidebarItem } from "vocs";
import { resources } from "./shared.js";

export const reactSidebar: SidebarItem[] = [
  { text: "React", link: "/" },
  {
    text: "React overview",
    link: "/react/overview",
  },
  {
    text: "React quickstart",
    link: "/react/quickstart",
  },
  {
    text: "Server side rendering",
    link: "/react/ssr",
  },
  {
    text: "Using smart accounts",
    items: [
      {
        text: "Authenticate users",
        link: "/react/authenticate-users",
      },
      {
        text: "Send user operations",
        link: "/react/send-user-operations",
      },
      { text: "Sponsor gas", link: "/react/sponsor-gas" },
      { text: "Add passkey", link: "/react/add-passkey" },
      { text: "Multi-chain apps", link: "/react/multi-chain-apps" },
    ],
  },
  {
    text: "SDK Reference - React",
    link: "/reference/account-kit/react",
  },
  resources,
];
