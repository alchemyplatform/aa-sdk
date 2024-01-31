import { defineConfig } from "vitepress";
import { packagesSidebar } from "./sidebar/packages";

const pkg = require("../../lerna.json");

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  themeConfig: {
    logo: "/kit-logo.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Docs", link: "/overview/getting-started" },
      {
        text: "Examples",
        link: "https://github.com/alchemyplatform/aa-sdk/tree/main/examples",
      },
      {
        text: pkg.version,
        items: [
          {
            text: "Migrating to 3.x.x",
            link: "/migration-guide",
          },
          {
            text: "Changelog",
            link: "https://github.com/alchemyplatform/aa-sdk/blob/main/CHANGELOG.md",
          },
          {
            text: "Contributing",
            link: "https://github.com/alchemyplatform/aa-sdk/blob/main/CONTRIBUTING.md",
          },
        ],
      },
    ],

    search: {
      provider: "algolia",
      options: {
        appId: "P2YIRI1HM5",
        apiKey: "2532e837d6c22886172745e30e650cda",
        indexName: "accountkit-alchemy",
      },
    },

    sidebar: [
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
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/alchemyplatform/aa-sdk" },
    ],
  },
  head: [
    [
      "script",
      {
        src: "https://static.alchemyapi.io/scripts/anayltics/alchemy-analytics.js",
        defer: "defer",
      },
    ],
    ["link", { rel: "icon", href: "/favicon.ico" }],

    // Open Graph tags
    ["meta", { property: "og:title", content: "Account Kit" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Account Kit is a framework to embed smart accounts in your web3 app, unlocking powerful features like email/social login, gas sponsorship, batched transactions, and more.",
      },
    ],
    ["meta", { property: "og:image", content: "/images/og-image.jpg" }],
    ["meta", { property: "og:image:type", content: "image/jpeg" }],
    ["meta", { property: "og:image:width", content: "2400" }],
    ["meta", { property: "og:image:height", content: "1260" }],

    // Twitter Card tags
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: "Account Kit" }],
    [
      "meta",
      {
        name: "twitter:description",
        content:
          "Account Kit is a framework to embed smart accounts in your web3 app, unlocking powerful features like email/social login, gas sponsorship, batched transactions, and more.",
      },
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content:
          "https://github-production-user-asset-6210df.s3.amazonaws.com/83442423/274634864-34ec38a9-3de2-4075-9723-e998fa8aa7d8.jpg",
      },
    ],
  ],
  sitemap: {
    hostname: "https://accountkit.alchemy.com",
  },
});
