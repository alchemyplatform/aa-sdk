import { SidebarItem } from "vocs";

export const reactSidebar: SidebarItem[] = [
  {
    text: "Overview",
    items: [
      { text: "Introduction", link: "/react/overview" },
      { text: "Getting with components", link: "#TODO" },
      { text: "Getting started with hooks", link: "#TODO" },
    ],
  },
  {
    text: "Using smart accounts (illustrative)",
    items: [
      {
        text: "Send user operations",
        link: "#TODO",
      },
      {
        text: "Batch user operations",
        link: "#TODO",
      },
      {
        text: "Sponsor gas",
        collapsed: false,
        items: [
          {
            text: "Use the Gas Manager",
            link: "#TODO",
          },
          {
            text: "Check eligibility",
            link: "#TODO",
          },
        ],
      },
      {
        text: "Simulate user operations",
        link: "#TODO",
      },
      {
        text: "Session keys",
        collapsed: false,
        items: [
          {
            text: "Overview",
            link: "#TODO",
          },
          {
            text: "Getting started",
            link: "#TODO",
          },
          {
            text: "Supported permissions",
            link: "#TODO",
          },
        ],
      },
      {
        text: "Transfer ownership",
        collapsed: false,
        items: [
          {
            text: "Modular Account",
            link: "#TODO",
          },
          {
            text: "Light Account",
            link: "#TODO",
          },
          {
            text: "Multi-Owner Light Account",
            link: "#TODO",
          },
        ],
      },
      {
        text: "Alchemy enhanced APIs",
        collapsed: false,
        items: [
          {
            text: "Get account NFTs",
            link: "#TODO",
          },
          {
            text: "Get account tokens",
            link: "#TODO",
          },
        ],
      },
    ],
  },
  {
    text: "React components",
    items: [
      { text: "createConfig", link: "/react/createConfig" },
      { text: "SSR", link: "/react/ssr" },
      { text: "Auth Modal", link: "#TODO" },
    ],
  },
  {
    text: "React hooks",
    items: [
      { text: "createConfig", link: "/react/createConfig" },
      { text: "SSR", link: "/react/ssr" },
      { text: "useAuthenticate", link: "/react/useAuthenticate" },
      {
        text: "useSmartAccountClient",
        link: "/react/useSmartAccountClient",
      },
      { text: "useClientActions", link: "/react/useClientActions" },
      { text: "useAccount", link: "/react/useAccount" },
      { text: "useSigner", link: "/react/useSigner" },
      { text: "useSignerStatus", link: "/react/useSignerStatus" },
      { text: "useUser", link: "/react/useUser" },
      { text: "useBundlerClient", link: "/react/useBundlerClient" },
      { text: "useAddPasskey", link: "/react/useAddPasskey" },
      { text: "useLogout", link: "/react/useLogout" },
      { text: "useExportAccount", link: "/react/useExportAccount" },
      { text: "useSignMessage", link: "/react/useSignMessage" },
      { text: "useSignTypedData", link: "/react/useSignTypedData" },
      { text: "useSendUserOperation", link: "/react/useSendUserOperation" },
      {
        text: "useDropAndReplaceUserOperation",
        link: "/react/useDropAndReplaceUserOperation",
      },
      {
        text: "useWaitForUserOperationTransaction",
        link: "/react/useWaitForUserOperationTransaction",
      },
      { text: "useSendTransaction", link: "/react/useSendTransaction" },
      { text: "useSendTransactions", link: "/react/useSendTransactions" },
      { text: "useChain", link: "/react/useChain" },
    ],
  },
];
