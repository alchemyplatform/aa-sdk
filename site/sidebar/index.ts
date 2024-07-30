import { SidebarItem } from "vocs";

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
];
