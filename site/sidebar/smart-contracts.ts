import { SidebarItem } from "vocs";

export const smartContractsSidebar: SidebarItem[] = [
  { text: "Overview", link: "/smart-contracts/overview" },
  {
    text: "Choosing a smart account",
    items: [
      {
        text: "Introduction",
        link: "/smart-contracts/choosing-a-smart-account",
      },
      {
        text: "Gas benchmarks",
        link: "https://github.com/alchemyplatform/aa-benchmarks",
      },
    ],
  },
  {
    text: "Light Account",
    items: [
      { text: "Overview", link: "/smart-contracts/light-account" },
      {
        text: "Getting started",
        link: "/smart-contracts/light-account/getting-started",
      },
      {
        text: "Manage ownership",
        link: "/smart-contracts/light-account",
      },
      {
        text: "Deployments",
        link: "/smart-contracts/light-account/deployments",
      },
    ],
  },
  {
    text: "Modular Account",
    items: [
      { text: "Overview", link: "/smart-contracts/modular-account" },
      {
        text: "Getting started",
        link: "/smart-contracts/modular-account/getting-started",
        collapsed: true,
      },
      {
        text: "Advanced",
        items: [
          {
            text: "Session keys",
            items: [
              { text: "Overview", link: "/smart-contracts/session-keys" },
              {
                text: "Getting started",
                link: "/smart-contracts/session-keys/getting-started",
              },
              {
                text: "Supported permissions",
                link: "/smart-contracts/session-keys/supported-permissions",
              },
            ],
            collapsed: true,
          },
          {
            text: "Manage plugins",
            items: [
              {
                text: "Install plugins",
                link: "/smart-contracts/install-plugins",
              },
              {
                text: "Get installed plugins",
                link: "/smart-contracts/get-installed-plugins",
              },
            ],
            collapsed: true,
          },
        ],
        collapsed: true,
      },
      {
        text: "Manage ownership",
        link: "/smart-contracts/modular-account/upgrading-to-modular-account",
      },
    ],
  },
  {
    text: "Upgrade accounts",
    link: "../third-party/smart-contracts",
  },
  {
    text: "Custom accounts",
    link: "../third-party/smart-contracts",
  },
  { text: "SDK Reference", link: "/reference/account-kit/smart-contracts" },
];
