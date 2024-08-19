import { SidebarItem } from "vocs";
import { coreSidebar } from "./core.js";
import { infraSidebar } from "./infra.js";
import { reactGuides } from "./react.js";
import { signerSidebar } from "./signer.js";
import { smartContractsSidebar } from "./smart-contracts.js";

export const resources: SidebarItem = {
  text: "Resources",
  items: [
    { text: "FAQs", link: "/resources/faqs" },
    { text: "React Native", link: "/resources/react-native" },
    { text: "Terms", link: "/resources/terms" },
    { text: "Types", link: "/resources/types" },
    { text: "Contact us", link: "/resources/contact-us" },
  ],
};

export const guides: (
  section?: "react" | "core" | "infra" | "signer" | "contracts"
) => SidebarItem = (section) => ({
  text: "Guides",
  items: [
    {
      text: "React",
      items: reactGuides,
      collapsed: section !== "react",
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
  ],
  collapsed: false,
});

export const concepts: SidebarItem = {
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
};

export const sharedSidebar: (
  section?: "react" | "core" | "infra" | "signer" | "contracts"
) => SidebarItem[] = (section) => [guides(section), concepts, resources];
