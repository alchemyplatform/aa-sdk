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
      { text: "Docs", link: "/getting-started" },
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
          // TODO: add a Contributing link and Migration links when necessary
        ],
      },
    ],

    search: {
      provider: "local",
    },

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Why Account Kit", link: "/why-account-kit" },
          { text: "Overview", link: "/introduction" },
          { text: "Getting Started", link: "/getting-started" },
          {
            text: "Package Overview",
            link: "/package-overview",
          },
          {
            text: "Demos",
            link: "/demos",
          },
        ],
      },
      {
        text: "Using Smart Accounts",
        base: "/smart-accounts",
        items: [
          { text: "Overview", link: "/overview" },
          {
            text: "Integrating a Smart Account",
            base: "/smart-accounts/accounts",
            link: "/overview",
            items: [
              { text: "Light Account", link: "/light-account" },
              { text: "Modular Account (soon)", link: "/modular-account" },
              { text: "Use Your Own Account", link: "/using-your-own" },
              {
                text: "Deployment Addresses",
                link: "/deployment-addresses",
              },
            ],
          },
          {
            text: "Integrating a Signer",
            base: "/smart-accounts/signers",
            link: "/overview",
            collapsed: true,
            items: [
              { text: "Magic", link: "/magic" },
              { text: "Web3Auth", link: "/web3auth" },
              { text: "Turnkey", link: "/turnkey" },
              { text: "Privy", link: "/privy" },
              { text: "Dynamic", link: "/dynamic" },
              { text: "Fireblocks", link: "/fireblocks" },
              { text: "Portal", link: "/portal" },
              { text: "Capsule", link: "/capsule" },
              { text: "Lit Protocol", link: "/lit" },
              { text: "Externally Owned Account", link: "/eoa" },
              { text: "Custom Signer", link: "/custom-signer" },
            ],
          },
          { text: "Sponsoring Gas", link: "/sponsoring-gas" },
          { text: "Batching Transactions", link: "/batching-transactions" },
          { text: "Transferring Ownership", link: "/transferring-ownership" },
        ],
      },
      {
        text: "aa-core",
        base: "/packages/aa-core",
        link: "/",
        collapsed: true,
        items: [
          {
            text: "Provider",
            collapsed: true,
            link: "/introduction",
            base: "/packages/aa-core/provider",
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
            link: "/introduction",
            base: "/packages/aa-core/accounts",
            collapsed: true,
            items: [
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
                    text: "getDeploymentState",
                    link: "/getDeploymentState",
                  },
                  {
                    text: "isAccountDeployed",
                    link: "/isAccountDeployed",
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
            link: "/",
            base: "/packages/aa-core/client",
            collapsed: true,
            items: [
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
            text: "Utilities",
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
        link: "/",
        collapsed: true,
        items: [
          {
            text: "AlchemyProvider",
            link: "/introduction",
            base: "/packages/aa-alchemy/provider",
            collapsed: true,
            items: [
              { text: "gasEstimator", link: "/gasEstimator" },
              {
                text: "withAlchemyGasManager",
                link: "/withAlchemyGasManager",
              },
            ],
          },
          {
            text: "Middleware",
            link: "/introduction",
            base: "/packages/aa-alchemy/middleware",
            collapsed: true,
            items: [
              {
                text: "withAlchemyGasFeeEstimator",
                link: "/withAlchemyGasFeeEstimator",
              },
              {
                text: "withAlchemyGasManager",
                link: "/withAlchemyGasManager",
              },
            ],
          },
          {
            text: "Utils",
            collapsed: true,
            link: "/introduction",
            base: "/packages/aa-alchemy/utils",
            items: [{ text: "SupportedChains", link: "/supportedChains" }],
          },
        ],
      },
      {
        text: "aa-accounts",
        collapsed: true,
        link: "/",
        base: "/packages/aa-accounts",
        items: [
          {
            text: "LightSmartContractAccount",
            collapsed: true,
            link: "/introduction",
            base: "/packages/aa-accounts/light-account",
            items: [
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
          { text: "Contributing", link: "/contributing" },
        ],
      },
      {
        text: "aa-ethers",
        base: "/packages/aa-ethers",
        link: "/",
        collapsed: true,
        items: [
          {
            text: "EthersProviderAdapter",
            collapsed: true,
            link: "/introduction",
            base: "/packages/aa-ethers/provider-adapter",
            items: [
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
            link: "/introduction",
            base: "/packages/aa-ethers/account-signer",
            items: [
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
            link: "/introduction",
            base: "/packages/aa-ethers/utils",
            items: [
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
