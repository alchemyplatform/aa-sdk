import { DefaultTheme } from "vitepress";
import { packagesSidebar } from "./packages";

export const sidebar: DefaultTheme.Sidebar = [
  {
    text: "Getting started",
    items: [
      {
        text: "Overview",
        link: "/getting-started/overview",
      },
      { text: "Quick start", link: "/getting-started/setup" },
    ],
  },
  {
    text: "Choosing a smart account",
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
          {
            text: "Upgrading to a Modular Account",
            link: "/upgrade-la-to-ma",
          },
        ],
      },
      {
        text: "Light Account",
        link: "/smart-accounts/light-account/",
      },
      {
        text: "Custom accounts",
        collapsed: true,
        base: "/smart-accounts/custom",
        items: [
          { text: "Use your own", link: "/using-your-own" },
          { text: "Contribute your account", link: "/contributing" },
        ],
      },
      { text: "Gas benchmarks", link: "/smart-accounts/gas-benchmarks" },
    ],
  },
  {
    text: "Choosing a signer",
    base: "/signers",
    items: [
      { text: "Introduction", link: "/choosing-a-signer" },
      { text: "Alchemy signer", link: "/alchemy-signer" },
      {
        text: "Third-party signers",
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
          { text: "WalletKit", link: "/walletkit" },
        ],
      },
      { text: "EOA signer", link: "/eoa" },
      {
        text: "Custom signer",
        collapsed: true,
        items: [
          {
            text: "Use your own",
            link: "/guides/custom-signer",
          },
          {
            text: "Contribute your signer",
            link: "/contributing",
          },
        ],
      },
    ],
  },
  {
    text: "Using smart accounts",
    base: "/using-smart-accounts",
    items: [
      { text: "Send user operations", link: "/send-user-operations" },
      { text: "Batch user operations", link: "/batch-user-operations" },
      {
        text: "Sponsor gas",
        collapsed: false,
        base: "/using-smart-accounts/sponsoring-gas",
        items: [
          { text: "Use the Gas Manager", link: "/gas-manager" },
          { text: "Check eligibility", link: "/checking-eligibility" },
        ],
      },
      { text: "Simulate user ops", link: "/simulate-user-operations" },
      {
        text: "Session keys",
        base: "/using-smart-accounts/session-keys",
        collapsed: false,
        items: [
          {
            text: "Overview",
            link: "/",
          },
          {
            text: "Getting started",
            link: "/getting-started",
          },
        ],
      },
      {
        text: "Transfer ownership",
        base: "/using-smart-accounts/transfer-ownership",
        collapsed: false,
        items: [
          { text: "Modular Account", link: "/modular-account" },
          { text: "Light Account", link: "/light-account" },
        ],
      },
      {
        text: "Alchemy enhanced APIs",
        base: "/using-smart-accounts/enhanced-apis",
        collapsed: false,
        items: [
          {
            text: "Get account NFTs",
            link: "/nft",
          },
          { text: "Get account tokens", link: "/token" },
        ],
      },
    ],
  },
  {
    text: "Extending smart accounts",
    base: "/extending-smart-accounts",
    items: [
      {
        text: "Install plugins",
        link: "/install-plugins",
      },
      {
        text: "Get installed plugins",
        link: "/get-installed-plugins",
      },
    ],
  },
  {
    text: "Custom infra",
    base: "/third-party",
    items: [
      { text: "Use custom bundler", link: "/bundlers" },
      { text: "Use custom paymaster", link: "/paymasters" },
    ],
  },
  packagesSidebar,
  {
    text: "Resources",
    base: "/resources",
    items: [
      { text: "FAQs", link: "/faqs" },
      { text: "Terms", link: "/terms" },
      { text: "Types", link: "/types" },
      { text: "Contact us", link: "/contact-us" },
    ],
  },
];
