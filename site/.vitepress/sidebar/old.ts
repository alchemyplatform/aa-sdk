import { DefaultTheme } from "vitepress";
import { packagesSidebar } from "./packages";

// TODO: remove this once we're done refactoring, keeping here for tracking
export const oldSidebar: DefaultTheme.Sidebar = [
  {
    text: "Overview",
    base: "/overview",
    items: [
      { text: "Why Account Kit", link: "/why-account-kit" },
      { text: "Introduction", link: "/introduction" },
      { text: "Getting Started", link: "/getting-started" },
      {
        text: "Packages Overview",
        link: "/package-overview",
      },
      {
        text: "Demos",
        link: "/demos",
      },
      {
        text: "FAQs",
        link: "/faqs",
      },
      {
        text: "Contact Us",
        link: "/contact-us",
      },
    ],
  },
  {
    text: "Smart Accounts",
    base: "/smart-accounts",
    items: [
      { text: "Overview", link: "/overview" },
      {
        text: "Choosing a Smart Account",
        base: "/smart-accounts/accounts",
        items: [
          { text: "Introduction", link: "/choosing-a-smart-account" },
          {
            text: "Smart Account Guides",
            base: "/smart-accounts/accounts/guides",
            collapsed: true,
            items: [
              { text: "Light Account", link: "/light-account" },
              { text: "Modular Account", link: "/modular-account" },
              { text: "Using Your Own", link: "/using-your-own" },
            ],
          },
          { text: "Deployments", link: "/deployment-addresses" },
          { text: "Contributing Your Account", link: "/contributing" },
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
              { text: "Using Your Own", link: "/custom-signer" },
            ],
          },
          { text: "Contributing Your Signer", link: "/contributing" },
        ],
      },
    ],
  },
  {
    text: "Tutorials",
    base: "/tutorials",
    items: [
      {
        text: "How to Send a User Operation",
        link: "/send-user-operation",
      },
      {
        text: "Gas Sponsorship",
        base: "/tutorials/sponsoring-gas",
        items: [
          {
            text: "How to Sponsor Gas for User Operations",
            link: "/sponsoring-gas",
          },
          {
            text: "How to Handle User Operations that are Not Eligible for Gas Sponsorship",
            link: "/gas-sponsorship-eligibility",
          },
        ],
      },
      { text: "How to Batch Transactions", link: "/batching-transactions" },
      {
        text: "How to Transfer Ownership of a Smart Account",
        link: "/transferring-ownership",
      },
      {
        text: "How to Simulate a User Operation",
        link: "/sim-user-operation",
      },
      {
        text: "Smart Account Data",
        base: "/tutorials/enhanced-apis",
        items: [
          {
            text: "How to Fetch a Smart Account's NFTs",
            link: "/nft",
          },
          {
            text: "How to Fetch a Smart Account's ERC-20 Tokens",
            link: "/token",
          },
        ],
      },
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
