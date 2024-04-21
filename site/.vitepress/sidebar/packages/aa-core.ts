import { DefaultTheme } from "vitepress/types/default-theme";

export const aaCoreSidebar: DefaultTheme.SidebarItem = {
  text: "aa-core",
  base: "/packages/aa-core",
  collapsed: true,
  items: [
    {
      text: "Getting started",
      link: "/",
    },
    {
      text: "Smart Account Client",
      base: "/packages/aa-core/smart-account-client",
      link: "/index",
    },
    {
      text: "Client Middleware",
      base: "/packages/aa-core/smart-account-client/middleware",
      link: "/index",
    },
    {
      text: "Smart Account Actions",
      collapsed: true,
      base: "/packages/aa-core/smart-account-client/actions",
      items: [
        {
          text: "sendUserOperation",
          link: "/sendUserOperation",
        },
        {
          text: "buildUserOperation",
          link: "/buildUserOperation",
        },
        {
          text: "signUserOperation",
          link: "/signUserOperation",
        },
        {
          text: "checkGasSponsorshipEligibility",
          link: "/checkGasSponsorshipEligibility",
        },
        {
          text: "buildUserOperationFromTx",
          link: "/buildUserOperationFromTx",
        },
        {
          text: "waitForUserOperationTransaction",
          link: "/waitForUserOperationTransaction",
        },
        {
          text: "dropAndReplaceUserOperation",
          link: "/dropAndReplaceUserOperation",
        },
        {
          text: "getUserOperationByHash",
          link: "/getUserOperationByHash",
        },
        {
          text: "getUserOperationReceipt",
          link: "/getUserOperationReceipt",
        },
        {
          text: "sendTransaction",
          link: "/sendTransaction",
        },
        {
          text: "sendTransactions",
          link: "/sendTransactions",
        },
        {
          text: "request",
          link: "/request",
        },
        {
          text: "signMessage",
          link: "/signMessage",
        },
        {
          text: "signTypedData",
          link: "/signTypedData",
        },
        {
          text: "signMessageWith6492",
          link: "/signMessageWith6492",
        },
        {
          text: "signTypedDataWith6492",
          link: "/signTypedDataWith6492",
        },
        {
          text: "getAddress",
          link: "/getAddress",
        },
        {
          text: "upgradeAccount",
          link: "/upgradeAccount",
        },
        {
          text: "Types",
          base: "/packages/aa-core/smart-account-client/types",
          collapsed: true,
          items: [
            {
              text: "UserOperationFeeOptions",
              link: "/userOperationFeeOptions",
            },
            {
              text: "UserOperationFeeOptionsField",
              link: "/userOperationFeeOptionsField",
            },
            {
              text: "UserOperationOverrides",
              link: "/userOperationOverrides",
            },
          ],
        },
      ],
    },
    {
      text: "Bundler Client",
      base: "/packages/aa-core/bundler-client",
      link: "/",
    },
    {
      text: "Bundler Actions",
      collapsed: true,
      base: "/packages/aa-core/bundler-client/actions",
      items: [
        {
          text: "sendRawUserOperation",
          link: "/sendRawUserOperation",
        },
        {
          text: "estimateUserOperationGas",
          link: "/estimateUserOperationGas",
        },
        {
          text: "getUserOperationByHash",
          link: "/getUserOperationByHash",
        },
        {
          text: "getUserOperationReceipt",
          link: "/getUserOperationReceipt",
        },
        {
          text: "getSupportedEntryPoints",
          link: "/getSupportedEntryPoints",
        },
      ],
    },
    {
      text: "Accounts",
      base: "/packages/aa-core/accounts",
      link: "/",
    },
    {
      text: "Signers",
      base: "/packages/aa-core/signers",
      collapsed: true,
      items: [
        { text: "WalletClientSigner", link: "/wallet-client" },
        { text: "LocalAccountSigner", link: "/local-account" },
        {
          text: "Utils",
          collapsed: true,
          base: "/packages/aa-core/signers/utils",
          items: [
            {
              text: "wrapSignatureWith6492",
              link: "/wrapSignatureWith6492",
            },
            {
              text: "verifyEIP6492Signature",
              link: "/verifyEIP6492Signature",
            },
          ],
        },
      ],
    },
    {
      text: "Utils",
      base: "/packages/aa-core/utils",
      collapsed: true,
      items: [
        { text: "asyncPipe", link: "/asyncPipe" },
        {
          text: "convertChainIdToCoinType",
          link: "/convertChainIdToCoinType",
        },
        {
          text: "convertCoinTypeToChain",
          link: "/convertCoinTypeToChain",
        },
        {
          text: "convertCoinTypeToChainId",
          link: "/convertCoinTypeToChainId",
        },
        { text: "deepHexlify", link: "/deepHexlify" },
        { text: "defineReadOnly", link: "/defineReadOnly" },
        { text: "getChain", link: "/getChain" },
        {
          text: "getDefaultEntryPointAddress",
          link: "/getDefaultEntryPointAddress",
        },
        {
          text: "getDefaultSimpleAccountFactoryAddress",
          link: "/getDefaultSimpleAccountFactoryAddress",
        },
        {
          text: "getUserOperationHash",
          link: "/getUserOperationHash",
        },
        { text: "resolveProperties", link: "/resolveProperties" },
        { text: "stringToIndex", link: "/stringToIndex" },
      ],
    },
  ],
};
