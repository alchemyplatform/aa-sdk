import { SidebarItem } from "vocs";

export const aaCoreSideBar: SidebarItem = {
  text: "aa-core",
  collapsed: true,
  items: [
    {
      text: "Getting started",
      link: "/packages/aa-core/",
    },
    {
      text: "Smart Account Client",
      link: "/packages/aa-core/smart-account-client/",
    },
    {
      text: "Client Middleware",
      link: "/packages/aa-core/smart-account-client/middleware/",
    },
    {
      text: "Smart Account Actions",
      collapsed: true,
      items: [
        {
          text: "sendUserOperation",
          link: "/packages/aa-core/smart-account-client/actions/sendUserOperation",
        },
        {
          text: "buildUserOperation",
          link: "/packages/aa-core/smart-account-client/actions/buildUserOperation",
        },
        {
          text: "signUserOperation",
          link: "/packages/aa-core/smart-account-client/actions/signUserOperation",
        },
        {
          text: "estimateUserOperationGas",
          link: "/packages/aa-core/smart-account-client/actions/estimateUserOperationGas",
        },
        {
          text: "checkGasSponsorshipEligibility",
          link: "/packages/aa-core/smart-account-client/actions/checkGasSponsorshipEligibility",
        },
        {
          text: "buildUserOperationFromTx",
          link: "/packages/aa-core/smart-account-client/actions/buildUserOperationFromTx",
        },
        {
          text: "waitForUserOperationTransaction",
          link: "/packages/aa-core/smart-account-client/actions/waitForUserOperationTransaction",
        },
        {
          text: "dropAndReplaceUserOperation",
          link: "/packages/aa-core/smart-account-client/actions/dropAndReplaceUserOperation",
        },
        {
          text: "getUserOperationByHash",
          link: "/packages/aa-core/smart-account-client/actions/getUserOperationByHash",
        },
        {
          text: "getUserOperationReceipt",
          link: "/packages/aa-core/smart-account-client/actions/getUserOperationReceipt",
        },
        {
          text: "sendTransaction",
          link: "/packages/aa-core/smart-account-client/actions/sendTransaction",
        },
        {
          text: "sendTransactions",
          link: "/packages/aa-core/smart-account-client/actions/sendTransactions",
        },
        {
          text: "request",
          link: "/packages/aa-core/smart-account-client/actions/request",
        },
        {
          text: "signMessage",
          link: "/packages/aa-core/smart-account-client/actions/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-core/smart-account-client/actions/signTypedData",
        },
        {
          text: "signMessageWith6492",
          link: "/packages/aa-core/smart-account-client/actions/signMessageWith6492",
        },
        {
          text: "signTypedDataWith6492",
          link: "/packages/aa-core/smart-account-client/actions/signTypedDataWith6492",
        },
        {
          text: "getAddress",
          link: "/packages/aa-core/smart-account-client/actions/getAddress",
        },
        {
          text: "upgradeAccount",
          link: "/packages/aa-core/smart-account-client/actions/upgradeAccount",
        },
        {
          text: "Types",
          collapsed: true,
          items: [
            {
              text: "UserOperationFeeOptions",
              link: "/packages/aa-core/smart-account-client/types/userOperationFeeOptions",
            },
            {
              text: "UserOperationFeeOptionsField",
              link: "/packages/aa-core/smart-account-client/types/userOperationFeeOptionsField",
            },
            {
              text: "UserOperationOverrides",
              link: "/packages/aa-core/smart-account-client/types/userOperationOverrides",
            },
          ],
        },
      ],
    },
    {
      text: "Bundler Client",
      link: "/packages/aa-core/bundler-client/",
    },
    {
      text: "Bundler Actions",
      collapsed: true,
      items: [
        {
          text: "sendRawUserOperation",
          link: "/packages/aa-core/bundler-client/actions/sendRawUserOperation",
        },
        {
          text: "estimateUserOperationGas",
          link: "/packages/aa-core/bundler-client/actions/estimateUserOperationGas",
        },
        {
          text: "getUserOperationByHash",
          link: "/packages/aa-core/bundler-client/actions/getUserOperationByHash",
        },
        {
          text: "getUserOperationReceipt",
          link: "/packages/aa-core/bundler-client/actions/getUserOperationReceipt",
        },
        {
          text: "getSupportedEntryPoints",
          link: "/packages/aa-core/bundler-client/actions/getSupportedEntryPoints",
        },
      ],
    },
    {
      text: "Accounts",
      link: "/packages/aa-core/accounts/",
    },
    {
      text: "Signers",
      collapsed: true,
      items: [
        {
          text: "WalletClientSigner",
          link: "/packages/aa-core/signers/wallet-client",
        },
        {
          text: "LocalAccountSigner",
          link: "/packages/aa-core/signers/local-account",
        },
        {
          text: "Utils",
          collapsed: true,
          items: [
            {
              text: "wrapSignatureWith6492",
              link: "/packages/aa-core/signers/utils/wrapSignatureWith6492",
            },
            {
              text: "verifyEIP6492Signature",
              link: "/packages/aa-core/signers/utils/verifyEIP6492Signature",
            },
          ],
        },
      ],
    },
    { text: "Split Transport", link: "/packages/aa-core/split-transport" },
    {
      text: "Utils",
      collapsed: true,
      items: [
        { text: "asyncPipe", link: "/packages/aa-core/utils/asyncPipe" },
        {
          text: "convertChainIdToCoinType",
          link: "/packages/aa-core/utils/convertChainIdToCoinType",
        },
        {
          text: "convertCoinTypeToChain",
          link: "/packages/aa-core/utils/convertCoinTypeToChain",
        },
        {
          text: "convertCoinTypeToChainId",
          link: "/packages/aa-core/utils/convertCoinTypeToChainId",
        },
        { text: "deepHexlify", link: "/packages/aa-core/utils/deepHexlify" },
        {
          text: "defineReadOnly",
          link: "/packages/aa-core/utils/defineReadOnly",
        },
        { text: "getChain", link: "/packages/aa-core/utils/getChain" },
        {
          text: "getDefaultEntryPointAddress",
          link: "/packages/aa-core/utils/getDefaultEntryPointAddress",
        },
        {
          text: "getDefaultSimpleAccountFactoryAddress",
          link: "/packages/aa-core/utils/getDefaultSimpleAccountFactoryAddress",
        },
        {
          text: "resolveProperties",
          link: "/packages/aa-core/utils/resolveProperties",
        },
        {
          text: "stringToIndex",
          link: "/packages/aa-core/utils/stringToIndex",
        },
      ],
    },
  ],
};
