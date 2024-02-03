import { DefaultTheme } from "vitepress";
import { packagesSidebar } from "./packages";

export const sidebar: DefaultTheme.Sidebar = [
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
      { text: "Introduction", link: "/smart-accounts/" },
      {
        text: "Modular Account",
        collapsed: false,
        base: "/smart-accounts/modular-account",
        items: [
          { text: "Introduction", link: "/" },
          { text: "Getting started", link: "/getting-started" },
          { text: "Deployments", link: "/deployments" },
        ],
      },
      {
        text: "Light Account",
        link: "/smart-accounts/light-account/",
      },
      {
        text: "Custom Accounts",
        collapsed: true,
        base: "/smart-accounts/custom",
        items: [
          { text: "Use your own", link: "/using-your-own" },
          { text: "Contribute your account", link: "/contributing" },
        ],
      },
      { text: "Gas Benchmarks", link: "/smart-accounts/gas-benchmarks" },
    ],
  },
  {
    text: "Choosing a Signer",
    base: "/signers",
    items: [
      { text: "Introduction", link: "/choosing-a-signer" },
      {
        text: "Signer Guides",
        base: "/signers/guides",
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
    base: "/using-smart-accounts",
    items: [
      { text: "Send User Operations", link: "/send-user-operations" },
      { text: "Batch User Operations", link: "/batch-user-operations" },
      {
        text: "Sponsoring Gas",
        collapsed: false,
        base: "/using-smart-accounts/sponsoring-gas",
        items: [
          { text: "Alchemy Gas Manager", link: "/gas-manager" },
          { text: "Check Eligibility", link: "/checking-eligibility" },
        ],
      },
      { text: "Simulate User Operations", link: "/simulate-user-operations" },
      {
        text: "Transfer Ownership",
        base: "/using-smart-accounts/transfer-ownership",
        collapsed: false,
        items: [
          { text: "Modular Account", link: "/modular-account" },
          { text: "Light Account", link: "/light-account" },
        ],
      },
      { text: "Session Keys", link: "/session-keys" },
      {
        text: "Alchemy Enhanced Apis",
        base: "/using-smart-accounts/enhanced-apis",
        collapsed: true,
        items: [
          {
            text: "Get Account's NFTs",
            link: "/nft",
          },
          { text: "Get Account's Tokens", link: "/token" },
        ],
      },
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
    base: "/third-party",
    items: [
      { text: "Bundlers", link: "/bundlers" },
      { text: "Paymasters", link: "/paymasters" },
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
