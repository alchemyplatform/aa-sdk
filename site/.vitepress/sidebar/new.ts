import { DefaultTheme } from "vitepress";
import { packagesSidebar } from "./packages";

export const newSidebar: DefaultTheme.Sidebar = [
  {
    text: "Getting Started",
    items: [
      { text: "Setup your project", link: "/getting-started/setup" },
      {
        text: "Deploy your first account",
        link: "/getting-started/deploy-an-account",
      },
      // I'm leaving these here for now because I'm not sure if we still want them
      // There's good content in here so we may want to keep it somewhere
      {
        text: "What is Account Kit?",
        link: "/overview/introduction",
      },
      {
        text: "Why Account Kit?",
        link: "/overview/why-account-kit",
      },
      {
        text: "FAQs",
        link: "/faqs",
      },
    ],
  },
  {
    text: "Choosing a Smart Account",
    items: [
      { text: "Introduction", link: "/" },
      {
        text: "Modular Account",
        collapsed: false,
        items: [
          { text: "Introduction", link: "/" },
          { text: "Getting started", link: "/" },
          { text: "Deployments", link: "/" },
        ],
      },
      {
        text: "Light Account",
        collapsed: true,
        items: [
          { text: "Introduction", link: "/" },
          { text: "Getting started", link: "/" },
          { text: "Deployments", link: "/" },
        ],
      },
      {
        text: "Custom Accounts",
        collapsed: true,
        items: [
          { text: "Use your own", link: "/" },
          { text: "Contribute your account", link: "/" },
        ],
      },
      { text: "Gas Benchmarks", link: "/" },
    ],
  },
  {
    text: "Choosing a Signer",
    base: "/smart-accounts/signers",
    items: [
      { text: "Introduction", link: "/choosing-a-signer" },
      {
        text: "Signer Guides",
        base: "/smart-accounts/signers/guides",
        collapsed: true,
        items: [
          { text: "Magic", link: "/magic" },
          { text: "Web3Auth", link: "/web3auth" },
          { text: "Turnkey", link: "/turnkey" },
          { text: "Privy", link: "/privy" },
          { text: "Dynamic", link: "/dynamic" },
          { text: "Fireblocks", link: "/fireblocks" },
          { text: "Portal", link: "/portal" },
          { text: "Capsule", link: "/capsule" },
          { text: "Lit Protocol", link: "/lit" },
          { text: "Particle Network", link: "/particle-network" },
          { text: "Arcana Auth", link: "/arcana-auth" },
          { text: "Dfns", link: "/dfns" },
          { text: "Externally Owned Account (EOA)", link: "/eoa" },
        ],
      },
      {
        text: "Custom Signer",
        collapsed: true,
        items: [
          {
            text: "Using Your Own",
            link: "/guides/custom-signer",
          },
          {
            text: "Contributing Your Signer",
            link: "/contributing",
          },
        ],
      },
    ],
  },
  {
    text: "Using Smart Accounts",
    items: [
      { text: "Send User Operations", link: "/" },
      { text: "Batch User Operations", link: "/" },
      { text: "Simulate User Operations", link: "/" },
      {
        text: "Transfer Ownership",
        collapsed: false,
        items: [{ text: "Modular Account" }, { text: "Light Account" }],
      },
      { text: "Session Keys", link: "/" },
      { text: "Alchemy Enhanced Apis", link: "/" },
    ],
  },
  {
    text: "Extending Smart Accounts",
    items: [
      { text: "Installing Plugins", link: "/" },
      { text: "Creating Plugins", link: "/" },
    ],
  },
  {
    text: "Third Party Integrations",
    items: [
      { text: "Bundlers", link: "/" },
      { text: "Paymasters", link: "/" },
    ],
  },
  packagesSidebar,
  {
    text: "Glossary",
    base: "/glossary",
    collapsed: true,
    items: [
      { text: "Terms", link: "/terms" },
      { text: "Types", link: "/types" },
    ],
  },
];
