import { SidebarItem } from "vocs";
import { concepts, guides, resources } from "./shared.js";

export const smartContractsSidebar: SidebarItem[] = [
  {
    text: "Overview",
    items: [
      { text: "Introduction", link: "/smart-contracts/overview" },
      { text: "Getting started", link: "#TODO" },
    ],
  },
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
            text: "Upgrading to Modular Account",
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
        link: "/smart-contracts/custom/using-your-own",
      },
      { text: "Gas benchmarks", link: "/smart-contracts/gas-benchmarks" },
    ],
  },
  {
    text: "Using smart accounts",
    items: [],
  },
  {
    text: "Extending smart accounts",
    items: [],
  },
  concepts,
  guides,
  resources,
];
