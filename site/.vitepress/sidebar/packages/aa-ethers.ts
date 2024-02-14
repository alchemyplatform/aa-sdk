import { DefaultTheme } from "vitepress/types/default-theme";

export const aaEthersSidebar: DefaultTheme.SidebarItem = {
  text: "aa-ethers",
  base: "/packages/aa-ethers",
  collapsed: true,
  items: [
    {
      text: "Getting started",
      link: "/",
    },
    {
      text: "EthersProviderAdapter",
      collapsed: true,
      base: "/packages/aa-ethers/provider-adapter",
      items: [
        {
          text: "Introduction",
          link: "/introduction",
        },
        {
          text: "constructor",
          link: "/constructor",
        },
        {
          text: "send",
          link: "/send",
        },
        {
          text: "connectToAccount",
          link: "/connectToAccount",
        },
        {
          text: "getBundlerClient",
          link: "/getBundlerClient",
        },
        {
          text: "fromEthersProvider",
          link: "/fromEthersProvider",
        },
      ],
    },
    {
      text: "AccountSigner",
      collapsed: true,
      base: "/packages/aa-ethers/account-signer",
      items: [
        {
          text: "Introduction",
          link: "/introduction",
        },
        {
          text: "getAddress",
          link: "/getAddress",
        },
        {
          text: "signMessage",
          link: "/signMessage",
        },
        {
          text: "sendTransaction",
          link: "/sendTransaction",
        },
        {
          text: "getBundlerClient",
          link: "/getBundlerClient",
        },
        {
          text: "connect",
          link: "/connect",
        },
      ],
    },
    {
      text: "Utils",
      collapsed: true,
      base: "/packages/aa-ethers/utils",
      items: [
        {
          text: "Introduction",
          link: "/introduction",
        },
        {
          text: "convertWalletToAccountSigner",
          link: "/convertWalletToAccountSigner",
        },
        {
          text: "convertEthersSignerToAccountSigner",
          link: "/convertEthersSignerToAccountSigner",
        },
      ],
    },
  ],
};
