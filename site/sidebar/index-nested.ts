import { SidebarItem } from "vocs";
import { resources } from "./shared.js";

export const indexSidebar: SidebarItem[] = [
  { text: "Overview", link: "/" },
  { text: "Quickstart", link: "/react/quickstart" },
  {
    text: "Guides",
    items: [
      {
        text: "React",
        link: "/react/overview",
        items: [],
        collapsed: true,
      },
      {
        text: "Other JS Frameworks",
        link: "/core/overview",
        items: [],
        collapsed: true,
      },
      {
        text: "Infra",
        link: "/infra/overview",
        items: [],
        collapsed: true,
      },
      {
        text: "Signer",
        link: "/signer/overview",
        items: [],
        collapsed: true,
      },
      {
        text: "Smart Contracts",
        link: "/smart-contracts/overview",
        items: [],
        collapsed: true,
      },
    ],
  },
  {
    text: "Concepts",
    items: [
      {
        text: "Smart Contract Account",
        link: "/concepts/smart-contract-account",
      },
      {
        text: "Smart Account Client",
        link: "/concepts/smart-account-client",
      },
      {
        text: "Bundler Client",
        link: "/concepts/bundler-client",
      },
      {
        text: "Smart Account Signer",
        link: "/concepts/smart-account-signer",
      },
      {
        text: "Middleware",
        link: "/concepts/middleware",
      },
    ],
    collapsed: false,
  },
  resources,
];
