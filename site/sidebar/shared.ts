import { SidebarItem } from "vocs";
import { coreSidebar } from "./core.js";
import { infraSidebar } from "./infra.js";
import { reactNativeSidebar } from "./react-native.js";
import { reactGuides } from "./react.js";
import { signerSidebar } from "./signer.js";
import { smartContractsSidebar } from "./smart-contracts.js";
import { thirdPartySidebar } from "./third-party.js";

export const concepts: SidebarItem = {
  text: "Concepts",
  collapsed: true,
  items: [
    {
      text: "Intro to Account Kit",
      link: "/concepts/intro-to-account-kit",
    },
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
};

export const resources: SidebarItem = {
  text: "Resources",
  items: [
    {
      text: "Third Party",
      items: thirdPartySidebar,
      collapsed: true,
    },
    { text: "Terms", link: "/resources/terms" },
    { text: "Types", link: "/resources/types" },
    { text: "FAQs", link: "/resources/faqs" },
    { text: "Contact us", link: "/resources/contact-us" },
  ],
};

export const guides: (
  section?:
    | "react"
    | "core"
    | "infra"
    | "signer"
    | "contracts"
    | "react-native",
) => SidebarItem[] = (section) => [
  {
    text: "React",
    items: reactGuides,
    collapsed: section !== "react",
  },
  {
    text: "React Native",
    items: reactNativeSidebar,
    collapsed: section !== "react-native",
  },
  {
    text: "Other JS Frameworks",
    items: coreSidebar,
    collapsed: section !== "core",
  },
  {
    text: "Infra",
    items: infraSidebar,
    collapsed: section !== "infra",
  },
  {
    text: "Signer",
    items: signerSidebar,
    collapsed: section !== "signer",
  },
  {
    text: "Smart Contracts",
    items: smartContractsSidebar,
    collapsed: section !== "contracts",
  },
];

export const sharedSidebar: (
  section?:
    | "react"
    | "core"
    | "infra"
    | "signer"
    | "contracts"
    | "react-native",
) => SidebarItem[] = (section) => [...guides(section), resources];
