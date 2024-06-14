import { SidebarItem } from "vocs";

export const aaAlchemySidebar: SidebarItem = {
  text: "aa-alchemy",
  collapsed: true,
  items: [
    {
      text: "Getting started",
      link: "/packages/aa-alchemy/",
    },
    {
      text: "Smart Account Client",
      link: "/packages/aa-alchemy/smart-account-client/",
    },
    {
      text: "Smart Account Actions",
      collapsed: true,
      items: [
        {
          text: "simulateUserOperation",
          link: "/packages/aa-alchemy/smart-account-client/actions/simulateUserOperation",
        },
        {
          text: "alchemyEnhancedApiActions",
          link: "/packages/aa-alchemy/smart-account-client/actions/alchemyEnhancedApiActions",
        },
      ],
    },
    {
      text: "Light Account Client",
      link: "/packages/aa-alchemy/light-account-client/",
    },
    {
      text: "Multisig Account Client",
      link: "/packages/aa-alchemy/modular-account-client/multisig-account-client",
    },
    {
      text: "Middleware",
      collapsed: true,
      items: [
        {
          text: "alchemyFeeEstimator",
          link: "/packages/aa-alchemy/middleware/alchemyFeeEstimator",
        },
        {
          text: "alchemyGasManagerMiddleware",
          link: "/packages/aa-alchemy/middleware/alchemyGasManagerMiddleware",
        },
        {
          text: "alchemyUserOperationSimulator",
          link: "/packages/aa-alchemy/middleware/alchemyUserOperationSimulator",
        },
      ],
    },
    {
      text: "Alchemy Signer",
      collapsed: true,
      items: [
        {
          text: "Overview",
          link: "/packages/aa-alchemy/signer/overview",
        },
        {
          text: "authenticate",
          link: "/packages/aa-alchemy/signer/authenticate",
        },
        {
          text: "disconnect",
          link: "/packages/aa-alchemy/signer/disconnect",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-alchemy/signer/getAuthDetails",
        },

        {
          text: "getAddress",
          link: "/packages/aa-alchemy/signer/getAddress",
        },
        {
          text: "signMessage",
          link: "/packages/aa-alchemy/signer/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-alchemy/signer/signTypedData",
        },
        {
          text: "getUser",
          link: "/packages/aa-alchemy/signer/getUser",
        },
        {
          text: "addPasskey",
          link: "/packages/aa-alchemy/signer/addPasskey",
        },
        {
          text: "exportWallet",
          link: "/packages/aa-alchemy/signer/exportWallet",
        },
      ],
    },
    {
      text: "Utils",
      collapsed: true,
      items: [
        {
          text: "defineAlchemyChain",
          link: "/packages/aa-alchemy/utils/defineAlchemyChain",
        },
      ],
    },
  ],
};
