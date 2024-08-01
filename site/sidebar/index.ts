import { SidebarItem } from "vocs";
import { resources } from "./shared.js";

export const indexSidebar: SidebarItem[] = [
  { text: "Overview", link: "/" },
  { text: "Quickstart", link: "/react/quickstart" },
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
  },
  {
    text: "Guides",
    items: [
      {
        text: "React",
        link: "/react/overview",
      },
      {
        text: "Other JS Frameworks",
        link: "/core/overview",
      },
      {
        text: "Infra",
        link: "/infra/overview",
      },
      {
        text: "Signer",
        link: "/signer/overview",
      },
      {
        text: "Smart Contracts",
        link: "/smart-contracts/overview",
      },
    ],
  },
  resources,
];
