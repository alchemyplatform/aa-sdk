import { SidebarItem } from "vocs";

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

export const guides: SidebarItem = {
  text: "Guides",
  items: [
    {
      text: "React",
      link: "/react/overview",
    },
    {
      text: "Other JS Frameworks",
      link: "/core/overview",
    },
    {
      text: "Infra",
      link: "/infra/overview",
    },
    {
      text: "Signer",
      link: "/signer/overview",
    },
    {
      text: "Smart Contracts",
      link: "/smart-contracts/overview",
    },
  ],
};

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

export const sharedSidebar: SidebarItem[] = [guides, concepts, resources];
