import { defineConfig } from "vitepress";
import { sidebar } from "./sidebar";

const pkg = require("../../lerna.json");

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  themeConfig: {
    logo: "/kit-logo.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Docs", link: "/getting-started/introduction" },
      {
        text: "Examples",
        link: "https://github.com/alchemyplatform/aa-sdk/tree/main/examples",
      },
      {
        text: pkg.version,
        items: [
          {
            text: "Migrating to 3.x.x",
            link: "/migration-guides/migrating-to-v3",
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

    sidebar: sidebar,

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
