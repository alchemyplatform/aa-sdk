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
            link: "/overview",
            items: [
              { text: "Magic.Link", link: "/magic-link" },
              { text: "Web3Auth", link: "/web3auth" },
              { text: "Externally Owned Account", link: "/eoa" },
              { text: "Using Your Own", link: "/using-your-own" },
              { text: "Contributing", link: "/contributing" },
            ],
          },
          { text: "Sponsoring Gas", link: "/sponsoring-gas" },
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
            items: [
              { text: "sendUserOperation", link: "/sendUserOperation" },
              {
                text: "waitForUserOperationTransaction",
                link: "/waitForUserOperationTransaction",
              },
              {
                text: "getUserOperationByHash",
                link: "/getUserOperationByHash",
              },
            ],
          },
          { text: "Accounts" },
          {
            text: "Signers",
            base: "/packages/aa-core/signers",
            items: [
              { text: "WalletClientSigner", link: "/wallet-client" },
              { text: "LocalAccountSigner", link: "/local-account" },
              {
                text: "Utils",
                collapsed: true,
                base: "/packages/aa-core/signers/utils",
                items: [
                  { text: "wrapWith6492", link: "/wrapWith6492" },
                  {
                    text: "verifyEIP6492Signature",
                    link: "/verifyEIP6492Signature",
                  },
                ],
              },
            ],
          },
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
          {
            text: "LightSmartContractAccount",
            link: "/introduction",
            base: "/packages/aa-accounts/light-account",
            items: [
              { text: "signMessageWith6492", link: "/signMessageWith6492" },
              { text: "signTypedData", link: "/signTypedData" },
              { text: "signTypedDataWith6492", link: "/signTypedDataWith6492" },
              { text: "getOwner", link: "/getOwner" },
              {
                text: "encodeTransferOwnership",
                link: "/encodeTransferOwnership",
              },
              { text: "transferOwnership", link: "/transferOwnership" },
            ],
          },
          { text: "Contributing", link: "/contributing" },
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
