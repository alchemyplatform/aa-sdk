import { $ } from "execa";
import { defineConfig } from "vitepress";

// This makes sure that this works in forked repos as well
const getRepoRoute = $.sync`git rev-parse --show-toplevel`;
const { stdout: basePath } = $.sync`basename ${getRepoRoute}`;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  base: `/${basePath}`,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Docs", link: "/getting-started" },
      {
        text: "Examples",
        link: "https://github.com/alchemyplatform/aa-sdk/tree/main/examples",
      },
    ],

    sidebar: [
      { text: "Introduction", link: "/introduction" },
      { text: "Getting Started", link: "/getting-started" },
      {
        text: "Packages Overview",
        link: "/packages/overview",
      },
      {
        text: "Using Smart Accounts",
        base: "/smart-accounts",
        items: [
          { text: "Overview", link: "/overview" },
          {
            text: "Choosing a Smart Account",
            base: "/smart-accounts/accounts",
            link: "/light-account",
            items: [
              { text: "Light Account", link: "/light-account" },
              { text: "Modular Account", link: "/modular-account" },
              { text: "Using Your Own", link: "/using-your-own" },
            ],
          },
          {
            text: "Choosing a Signer",
            base: "/smart-accounts/signers",
            items: [
              { text: "Magic.Link", link: "/magic-link" },
              { text: "Web3Auth", link: "/web3auth" },
              { text: "Externally Owned Account", link: "/eoa" },
            ],
          },
          { text: "Sponsoring Gas", items: [] },
          { text: "Batching Transactions", link: "/batching-transactions" },
          { text: "Transferring Ownership", link: "/transferring-ownership" },
        ],
      },
      // Per Package docs
      {
        text: "aa-core",
        base: "/packages/aa-core",
        link: "/",
        collapsed: true,
        items: [
          {
            text: "Provider",
            link: "/introduction",
            base: "/packages/aa-core/provider",
            items: [{ text: "sendUserOperation", link: "/sendUserOperation" }],
          },
          { text: "Accounts" },
          { text: "Signers" },
          { text: "Public Client" },
          { text: "Utilities" },
        ],
      },
      {
        text: "aa-alchemy",
        base: "/packages/aa-alchemy",
        link: "/",
        collapsed: true,
        items: [],
      },
      {
        text: "aa-accounts",
        collapsed: true,
        link: "/",
        base: "/packages/aa-accounts",
        items: [
          { text: "Contributing", link: "/contributing" },
          {
            text: "LightSmartContractAccount",
            link: "/light-account",
          },
        ],
      },
      {
        text: "aa-ethers",
        base: "/packages/aa-ethers",
        link: "/",
        collapsed: true,
        items: [],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/alchemyplatform/aa-sdk" },
    ],
  },
});
