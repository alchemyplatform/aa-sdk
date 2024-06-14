import { SidebarItem } from "vocs";

export const aaEthersSidebar: SidebarItem = {
  text: "aa-ethers",
  collapsed: true,
  items: [
    {
      text: "Getting started",
      link: "/packages/aa-ethers/",
    },
    {
      text: "EthersProviderAdapter",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-ethers/provider-adapter/introduction",
        },
        {
          text: "constructor",
          link: "/packages/aa-ethers/provider-adapter/constructor",
        },
        {
          text: "send",
          link: "/packages/aa-ethers/provider-adapter/send",
        },
        {
          text: "connectToAccount",
          link: "/packages/aa-ethers/provider-adapter/connectToAccount",
        },
        {
          text: "getBundlerClient",
          link: "/packages/aa-ethers/provider-adapter/getBundlerClient",
        },
        {
          text: "fromEthersProvider",
          link: "/packages/aa-ethers/provider-adapter/fromEthersProvider",
        },
      ],
    },
    {
      text: "AccountSigner",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-ethers/account-signer/introduction",
        },
        {
          text: "getAddress",
          link: "/packages/aa-ethers/account-signer/getAddress",
        },
        {
          text: "signMessage",
          link: "/packages/aa-ethers/account-signer/signMessage",
        },
        {
          text: "sendTransaction",
          link: "/packages/aa-ethers/account-signer/sendTransaction",
        },
        {
          text: "getBundlerClient",
          link: "/packages/aa-ethers/account-signer/getBundlerClient",
        },
        {
          text: "connect",
          link: "/packages/aa-ethers/account-signer/connect",
        },
      ],
    },
    {
      text: "Utils",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-ethers/utils/introduction",
        },
        {
          text: "convertWalletToAccountSigner",
          link: "/packages/aa-ethers/utils/convertWalletToAccountSigner",
        },
        {
          text: "convertEthersSignerToAccountSigner",
          link: "/packages/aa-ethers/utils/convertEthersSignerToAccountSigner",
        },
      ],
    },
  ],
};
