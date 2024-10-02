import { SidebarItem } from "vocs";

export const infraSidebar: SidebarItem[] = [
  { text: "Overview", link: "/infra/overview" },
  { text: "Quickstart", link: "/infra/quickstart" },
  {
    text: "Using smart accounts",
    items: [
      {
        text: "Send user operations",
        link: "/infra/send-user-operations",
      },
      {
        text: "Sponsor gas",
        link: "/infra/sponsor-gas",
      },
      {
        text: "Retry user operations",
        link: "/infra/drop-and-replace",
      },
    ],
  },
  {
    text: "Third party",
    items: [
      {
        text: "Bundlers",
        link: "../third-party/bundlers",
      },
      { text: "Paymaster", link: "../third-party/paymasters" },
    ],
  },
  { text: "SDK Reference", link: "/reference/account-kit/infra" },
];
