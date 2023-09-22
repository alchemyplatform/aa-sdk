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
              { text: "Simple Account", link: "/simple-account" },
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
          { text: "Batching Transactions", items: [] },
          { text: "Transferring Ownership", link: "/transferring-ownership" },
        ],
      },
      {
        text: "Packages",
        collapsed: false,
        base: "/packages",
        items: [
          { text: "Overview", link: "/overview" },
          { text: "aa-core", link: "/aa-core" },
          { text: "aa-alchemy", link: "/aa-alchemy" },
          {
            text: "aa-accounts",
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
          { text: "aa-ethers", link: "/aa-ethers" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/alchemyplatform/aa-sdk" },
    ],
  },
});
