import { defineConfig } from "vitepress";

const pkg = require("../../lerna.json");

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  themeConfig: {
    logo: "/kit-logo.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Docs", link: "/overview/getting-started" },
      {
        text: "Examples",
        link: "https://github.com/alchemyplatform/aa-sdk/tree/main/examples",
      },
      {
        text: pkg.version,
        items: [
          {
            text: "Changelog",
            link: "https://github.com/alchemyplatform/aa-sdk/blob/main/CHANGELOG.md",
          },
          {
            text: "Contributing",
            link: "https://github.com/alchemyplatform/aa-sdk/blob/main/CONTRIBUTING.md",
          },
        ],
      },
    ],

    search: {
      provider: "algolia",
      options: {
        appId: "P2YIRI1HM5",
        apiKey: "2532e837d6c22886172745e30e650cda",
        indexName: "accountkit-alchemy",
      },
    },

    sidebar: [
      {
        text: "Overview",
        base: "/overview",
        items: [
          { text: "Why Account Kit", link: "/why-account-kit" },
          { text: "Introduction", link: "/introduction" },
          { text: "Getting Started", link: "/getting-started" },
          {
            text: "Packages Overview",
            link: "/package-overview",
          },
          {
            text: "Demos",
            link: "/demos",
          },
        ],
      },
      {
        text: "Smart Accounts",
        base: "/smart-accounts",
        items: [
          { text: "Overview", link: "/overview" },
          {
            text: "Choosing a Smart Account",
            base: "/smart-accounts/accounts",
            items: [
              { text: "Introduction", link: "/choosing-a-smart-account" },
              { text: "Light Account", link: "/light-account" },
              {
                text: "Modular Account",
                link: "/modular-account",
              },
              {
                text: "Deployments",
                link: "/deployment-addresses",
              },
              { text: "Using Your Own", link: "/using-your-own" },
            ],
          },
          {
            text: "Choosing a Signer",
            base: "/smart-accounts/signers",
            items: [
              {
                text: "Introduction",
                link: "/choosing-a-signer",
              },
              { text: "Magic", link: "/magic" },
              { text: "Web3Auth", link: "/web3auth" },
              { text: "Turnkey", link: "/turnkey" },
              { text: "Privy", link: "/privy" },
              { text: "Dynamic", link: "/dynamic" },
              { text: "Fireblocks", link: "/fireblocks" },
              { text: "Portal", link: "/portal" },
              { text: "Capsule", link: "/capsule" },
              { text: "Lit Protocol", link: "/lit" },
              {
                text: "Particle Network",
                link: "/particle-network",
              },
              {
                text: "Arcana Auth",
                link: "/arcana-auth",
              },
              { text: "Externally Owned Account (EOA)", link: "/eoa" },
              {
                text: "Using Your Own",
                link: "/custom-signer",
              },
              { text: "Contributing Your Signer", link: "/contributing" },
            ],
          },
        ],
      },
      {
        text: "Guides",
        base: "/guides",
        items: [
          {
            text: "How to Send a User Operation",
            link: "/send-user-operation",
          },
          {
            text: "Gas Sponsorship",
            base: "/guides/sponsoring-gas",
            items: [
              {
                text: "How to Sponsor Gas for User Operations",
                link: "/sponsoring-gas",
              },
              {
                text: "How to Handle User Operations that are Not Eligible for Gas Sponsorship",
                link: "/gas-sponsorship-eligibility",
              },
            ],
          },
          { text: "How to Batch Transactions", link: "/batching-transactions" },
          {
            text: "How to Transfer Ownership of a Smart Account",
            link: "/transferring-ownership",
          },
          {
            text: "How to Simulate a User Operation",
            link: "/sim-user-operation",
          },
          {
            text: "Smart Account Data",
            base: "/guides/enhanced-apis",
            items: [
              {
                text: "How to Fetch a Smart Account's NFTs",
                link: "/nft",
              },
              {
                text: "How to Fetch a Smart Account's ERC-20 Tokens",
                link: "/token",
              },
            ],
          },
        ],
      },
      {
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
            text: "Types",
            base: "/packages/aa-core/types",
            collapsed: true,
            items: [
              {
                text: "UserOperationFeeOptions",
                link: "/UserOperationFeeOptions",
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
            ],
          },
        ],
      },
      {
        text: "aa-alchemy",
        base: "/packages/aa-alchemy",
        collapsed: true,
        items: [
          {
            text: "Getting Started",
            link: "/",
          },
          {
            text: "Provider",
            base: "/packages/aa-alchemy/provider",
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
                text: "factory",
                link: "/light-account-factory",
              },
              { text: "gasEstimator", link: "/gasEstimator" },
              {
                text: "simulateUserOperationAssetChanges",
                link: "/simulateUserOperationAssetChanges",
              },
              {
                text: "withAlchemyGasManager",
                link: "/withAlchemyGasManager",
              },
              {
                text: "withAlchemyUserOpSimulation",
                link: "/withAlchemyUserOpSimulation",
              },
              {
                text: "withAlchemyEnhancedApis",
                link: "/withAlchemyEnhancedApis",
              },
            ],
          },
          {
            text: "Middleware",
            base: "/packages/aa-alchemy/middleware",
            collapsed: true,
            items: [
              {
                text: "Introduction",
                link: "/introduction",
              },
              {
                text: "withAlchemyGasFeeEstimator",
                link: "/withAlchemyGasFeeEstimator",
              },
              {
                text: "withAlchemyGasManager",
                link: "/withAlchemyGasManager",
              },
              {
                text: "withAlchemyUserOpSimulation",
                link: "/withAlchemyUserOpSimulation",
              },
            ],
          },
          {
            text: "Utils",
            collapsed: true,
            base: "/packages/aa-alchemy/utils",
            items: [
              {
                text: "Introduction",
                link: "/introduction",
              },
              { text: "SupportedChains", link: "/supportedChains" },
            ],
          },
        ],
      },
      {
        text: "aa-accounts",
        collapsed: true,
        base: "/packages/aa-accounts",
        items: [
          {
            text: "Getting Started",
            link: "/",
          },
          {
            text: "Light Account",
            collapsed: true,
            base: "/packages/aa-accounts/light-account",
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
                text: "provider",
                link: "/provider",
              },
              {
                text: "signMessageWith6492",
                link: "/signMessageWith6492",
              },
              { text: "signTypedData", link: "/signTypedData" },
              {
                text: "signTypedDataWith6492",
                link: "/signTypedDataWith6492",
              },
              { text: "getOwnerAddress", link: "/getOwnerAddress" },
              {
                text: "encodeTransferOwnership",
                link: "/encodeTransferOwnership",
              },
              { text: "transferOwnership", link: "/transferOwnership" },
            ],
          },
          {
            text: "Utils",
            collapsed: true,
            base: "/packages/aa-accounts/utils",
            items: [
              {
                text: "getDefaultLightAccountFactoryAddress",
                link: "/getDefaultLightAccountFactoryAddress",
              },
            ],
          },
          { text: "Contributing", link: "/contributing" },
        ],
      },
      {
        text: "aa-signers",
        collapsed: true,
        base: "/packages/aa-signers",
        items: [
          {
            text: "Getting Started",
            link: "/",
          },
          {
            text: "Magic Signer",
            collapsed: true,
            base: "/packages/aa-signers/magic",
            items: [
              { text: "Introduction", link: "/introduction" },
              { text: "constructor", link: "/constructor" },
              { text: "authenticate", link: "/authenticate" },
              { text: "getAddress", link: "/getAddress" },
              { text: "signMessage", link: "/signMessage" },
              { text: "signTypedData", link: "/signTypedData" },
              { text: "getAuthDetails", link: "/getAuthDetails" },
            ],
          },
          {
            text: "Web3Auth Signer",
            collapsed: true,
            base: "/packages/aa-signers/web3auth",
            items: [
              { text: "Introduction", link: "/introduction" },
              { text: "constructor", link: "/constructor" },
              { text: "authenticate", link: "/authenticate" },
              { text: "getAddress", link: "/getAddress" },
              { text: "signMessage", link: "/signMessage" },
              { text: "signTypedData", link: "/signTypedData" },
              { text: "getAuthDetails", link: "/getDgetAuthDetailsetails" },
            ],
          },
          { text: "Contributing", link: "/contributing" },
        ],
      },
      {
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
      },
      {
        text: "Glossary",
        base: "/glossary",
        items: [
          {
            text: "Types",
            base: "/glossary/types",
            collapsed: true,
            items: [
              { text: "BigNumberish", link: "/bigNumberish" },
              {
                text: "BigNumberishRange",
                link: "/bigNumberishRange",
              },
              {
                text: "Percentage",
                link: "/percentage",
              },
            ],
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/alchemyplatform/aa-sdk" },
    ],
  },
  head: [
    [
      "script",
      {
        src: "https://static.alchemyapi.io/scripts/anayltics/alchemy-analytics.js",
        defer: "defer",
      },
    ],
    ["link", { rel: "icon", href: "/favicon.ico" }],

    // Open Graph tags
    ["meta", { property: "og:title", content: "Account Kit" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Account Kit is a framework to embed smart accounts in your web3 app, unlocking powerful features like email/social login, gas sponsorship, batched transactions, and more.",
      },
    ],
    ["meta", { property: "og:image", content: "/images/og-image.jpg" }],
    ["meta", { property: "og:image:type", content: "image/jpeg" }],
    ["meta", { property: "og:image:width", content: "2400" }],
    ["meta", { property: "og:image:height", content: "1260" }],

    // Twitter Card tags
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: "Account Kit" }],
    [
      "meta",
      {
        name: "twitter:description",
        content:
          "Account Kit is a framework to embed smart accounts in your web3 app, unlocking powerful features like email/social login, gas sponsorship, batched transactions, and more.",
      },
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content:
          "https://github-production-user-asset-6210df.s3.amazonaws.com/83442423/274634864-34ec38a9-3de2-4075-9723-e998fa8aa7d8.jpg",
      },
    ],
  ],
  sitemap: {
    hostname: "https://accountkit.alchemy.com",
  },
});
