import { SidebarItem } from "vocs";

export const smartContractsSidebar: SidebarItem[] = [
  { text: "Overview", link: "/smart-contracts/overview" },
  {
    text: "Choosing a smart account",
    link: "/smart-contracts/choosing-a-smart-account",
  },
  {
    text: "Modular Account V2",
    items: [
      {
        text: "Overview",
        link: "/smart-contracts/modular-account-v2/overview",
      },
      {
        text: "Getting started",
        link: "/smart-contracts/modular-account-v2/getting-started",
      },
      {
        text: "Using 7702",
        link: "/smart-contracts/modular-account-v2/using-7702",
      },
    ],
  },
  {
    text: "Other Accounts",
    items: [
      {
        text: "Modular Account V1",
        items: [
          {
            text: "Overview",
            link: "/smart-contracts/other-accounts/modular-account",
          },
          {
            text: "Getting started",
            link: "/smart-contracts/other-accounts/modular-account/getting-started",
          },
          {
            text: "Manage multiple owners",
            link: "/smart-contracts/other-accounts/modular-account/manage-ownership-mav1",
          },
          {
            text: "Upgrade to MAv1",
            link: "/smart-contracts/other-accounts/modular-account/upgrading-to-modular-account",
          },
          {
            text: "Multisig",
            items: [
              {
                text: "Introduction",
                link: "/smart-contracts/other-accounts/modular-account/multisig-plugin",
              },
              {
                text: "Getting started",
                link: "/smart-contracts/other-accounts/modular-account/multisig-plugin/getting-started",
              },
              {
                text: "Technical details",
                link: "/smart-contracts/other-accounts/modular-account/multisig-plugin/details",
              },
            ],
            collapsed: true,
          },
          {
            text: "Session keys",
            items: [
              {
                text: "Overview",
                link: "/smart-contracts/other-accounts/modular-account/session-keys",
              },
              {
                text: "Getting started",
                link: "/smart-contracts/other-accounts/modular-account/session-keys/getting-started",
              },
              {
                text: "Supported permissions",
                link: "/smart-contracts/other-accounts/modular-account/session-keys/supported-permissions",
              },
            ],
            collapsed: true,
          },
          {
            text: "Manage plugins",
            items: [
              {
                text: "Install plugins",
                link: "/smart-contracts/other-accounts/modular-account/manage-plugins/install-plugins",
              },
              {
                text: "Get installed plugins",
                link: "/smart-contracts/other-accounts/modular-account/manage-plugins/get-installed-plugins",
              },
            ],
            collapsed: true,
          },
        ],
      },
      {
        text: "Light Account",
        items: [
          {
            text: "Overview",
            link: "/smart-contracts/other-accounts/light-account",
          },
          {
            text: "Getting started",
            link: "/smart-contracts/other-accounts/light-account/getting-started",
          },
          {
            text: "Transfer ownership",
            link: "/smart-contracts/other-accounts/light-account/transfer-ownership-light-account",
          },
          {
            text: "Manage multiple owners",
            link: "/smart-contracts/other-accounts/light-account/multi-owner-light-account",
          },
        ],
      },
      {
        text: "Custom accounts",
        link: "../third-party/smart-contracts",
      },
    ],
    collapsed: true,
  },
  {
    text: "Gas benchmarks",
    link: "https://github.com/alchemyplatform/aa-benchmarks",
  },
  {
    text: "Deployment addresses",
    link: "/smart-contracts/deployed-addresses",
  },
  { text: "SDK Reference", link: "/reference/account-kit/smart-contracts" },
];
