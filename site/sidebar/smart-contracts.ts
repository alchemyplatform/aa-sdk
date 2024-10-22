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
        text: "Modular Account",
        items: [
          { text: "Overview", link: "/smart-contracts/modular-account" },
          {
            text: "Getting started",
            link: "/smart-contracts/modular-account/getting-started",
          },
          {
            text: "Deployments",
            link: "/smart-contracts/modular-account/deployments",
          },
          {
            text: "Upgrade",
            link: "/smart-contracts/modular-account/upgrading-to-modular-account",
          },
          {
            text: "Multisig plugin",
            items: [
              {
                text: "Introduction",
                link: "/smart-contracts/modular-account/multisig-plugin",
              },
              {
                text: "Getting started",
                link: "/smart-contracts/modular-account/multisig-plugin/getting-started",
              },
              {
                text: "Technical details",
                link: "/smart-contracts/modular-account/multisig-plugin/details",
              },
            ],
            collapsed: true,
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
            text: "Deployments",
            link: "/smart-contracts/light-account/deployments",
          },
        ],
      },
      {
        text: "Custom accounts",
        link: "../third-party/smart-contracts",
      },
      { text: "Gas benchmarks", link: "/smart-contracts/gas-benchmarks" },
    ],
  },
  {
    text: "Using smart accounts",
    items: [
      {
        text: "Transfer ownership",
        items: [
          {
            text: "Modular Account",
            link: "/smart-contracts/transfer-ownership/modular-account",
          },
          {
            text: "Light Account",
            link: "/smart-contracts/transfer-ownership/light-account",
          },
          {
            text: "Multi-Owner LightAccount",
            link: "/smart-contracts/transfer-ownership/multi-owner-light-account",
          },
        ],
      },
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
      },
    ],
  },
  {
    text: "Extending smart accounts",
    items: [
      { text: "Install plugins", link: "/smart-contracts/install-plugins" },
      {
        text: "Get installed plugins",
        link: "/smart-contracts/get-installed-plugins",
      },
    ],
  },
  { text: "SDK Reference", link: "/reference/account-kit/smart-contracts" },
];
