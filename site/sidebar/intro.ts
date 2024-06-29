import { SidebarItem } from "vocs";

export const introSidebar: SidebarItem[] = [
  { text: "Introduction", link: "/intro" },
  {
    text: "Concepts",
    items: [
      {
        text: "Smart Account Client",
        link: "/intro/concepts/smart-account-client",
      },
      {
        text: "Smart Contract Account",
        link: "/intro/concepts/smart-contract-account",
      },
      {
        text: "Smart Account Signer",
        link: "/intro/concepts/smart-account-signer",
      },
    ],
  },
];
