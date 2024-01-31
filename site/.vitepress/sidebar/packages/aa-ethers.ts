import { DefaultTheme } from "vitepress/types/default-theme";

export const aaEthersSidebar: DefaultTheme.SidebarItem = {
  text: "aa-ethers",
  base: "/packages/aa-ethers",
  collapsed: true,
  items: [
    {
      text: "Getting Started",
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
          text: "getPublicErc4337Client",
          link: "/getPublicErc4337Client",
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
          text: "getPublicErc4337Client",
          link: "/getPublicErc4337Client",
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
