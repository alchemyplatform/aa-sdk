import { DefaultTheme } from "vitepress/types/default-theme";

export const aaCoreSidebar: DefaultTheme.SidebarItem = {
  text: "aa-core",
  base: "/packages/aa-core",
  collapsed: true,
  items: [
    {
      text: "Getting Started",
      link: "/",
    },
    {
      text: "Provider",
      collapsed: true,
      base: "/packages/aa-core/provider",
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
          text: "sendUserOperation",
          link: "/sendUserOperation",
        },
        {
          text: "buildUserOperation",
          link: "/buildUserOperation",
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
          text: "getEntryPointAddress",
          link: "/getEntryPointAddress",
        },
        {
          text: "isConnected",
          link: "/isConnected",
        },
        {
          text: "withPaymasterMiddleware",
          link: "/withPaymasterMiddleware",
        },
        {
          text: "withGasEstimator",
          link: "/withGasEstimator",
        },
        {
          text: "withFeeDataGetter",
          link: "/withFeeDataGetter",
        },
        {
          text: "withCustomMiddleware",
          link: "/withCustomMiddleware",
        },
        {
          text: "withUOSimulationMiddleware",
          link: "/withUOSimulationMiddleware",
        },
        {
          text: "connect",
          link: "/connect",
        },
        {
          text: "disconnect",
          link: "/disconnect",
        },
        {
          text: "extend",
          link: "/extend",
        },
        {
          text: "Types",
          base: "/packages/aa-core/provider/types",
          collapsed: true,
          items: [
            {
              text: "userOperationFeeOptions",
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
      text: "Accounts",
      base: "/packages/aa-core/accounts",
      collapsed: true,
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
          text: "Required Methods",
          collapsed: true,
          base: "/packages/aa-core/accounts/required",
          items: [
            {
              text: "getDummySignature",
              link: "/getDummySignature",
            },
            {
              text: "getAccountInitCode",
              link: "/getAccountInitCode",
            },
            {
              text: "signMessage",
              link: "/signMessage",
            },
            {
              text: "encodeExecute",
              link: "/encodeExecute",
            },
          ],
        },
        {
          text: "Optional Methods",
          collapsed: true,
          base: "/packages/aa-core/accounts/optional",
          items: [
            {
              text: "encodeBatchExecute",
              link: "/encodeBatchExecute",
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
              text: "signUserOperationHash",
              link: "/signUserOperationHash",
            },
          ],
        },
        {
          text: "Other Methods",
          collapsed: true,
          base: "/packages/aa-core/accounts/other",
          items: [
            {
              text: "getAddress",
              link: "/getAddress",
            },
            {
              text: "getNonce",
              link: "/getNonce",
            },
            {
              text: "getOwner",
              link: "/getOwner",
            },
            {
              text: "getDeploymentState",
              link: "/getDeploymentState",
            },
            {
              text: "isAccountDeployed",
              link: "/isAccountDeployed",
            },
            {
              text: "getFactoryAddress",
              link: "/getFactoryAddress",
            },
            {
              text: "getEntryPointAddress",
              link: "/getEntryPointAddress",
            },
          ],
        },
      ],
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
      text: "Public Client",
      base: "/packages/aa-core/client",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/",
        },
        {
          text: "Actions",
          collapsed: true,
          base: "/packages/aa-core/client/actions",
          items: [
            {
              text: "sendUserOperation",
              link: "/sendUserOperation",
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
          text: "createPublicErc4337Client",
          link: "/createPublicErc4337Client",
        },
        {
          text: "createPublicErc4337FromClient",
          link: "/createPublicErc4337FromClient",
        },
        {
          text: "erc4337ClientActions",
          link: "/erc4337ClientActions",
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
