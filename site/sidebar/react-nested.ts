import { SidebarItem } from "vocs";
import { resources } from "./shared.js";

export const reactSidebar: SidebarItem[] = [
  { text: "Overview", link: "/" },
  { text: "Quickstart", link: "/react/quickstart" },
  {
    text: "Guides",
    items: [
      {
        text: "React",
        items: [
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
        ],
        collapsed: false,
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
    collapsed: true,
  },
  resources,
];
