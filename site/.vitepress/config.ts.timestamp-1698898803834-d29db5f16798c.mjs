var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../lerna.json
var require_lerna = __commonJS({
  "../lerna.json"(exports, module) {
    module.exports = {
      $schema: "node_modules/lerna/schemas/lerna-schema.json",
      useWorkspaces: true,
      version: "0.1.1",
      useNx: true,
      npmClient: "yarn",
      conventionalCommits: true,
      changelog: true,
      command: {
        version: {
          message: "chore(release): publish %s [skip-ci]"
        }
      },
      granularPathspec: false
    };
  }
});

// .vitepress/config.ts
import { defineConfig } from "file:///Users/ajayvasisht/Desktop/alchemy/aa-sdk/node_modules/vitepress/dist/node/index.js";
var pkg = require_lerna();
var config_default = defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  themeConfig: {
    logo: "/kit-logo.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Docs", link: "/getting-started" },
      {
        text: "Examples",
        link: "https://github.com/alchemyplatform/aa-sdk/tree/main/examples"
      },
      {
        text: pkg.version,
        items: [
          {
            text: "Changelog",
            link: "https://github.com/alchemyplatform/aa-sdk/blob/main/CHANGELOG.md"
          },
          {
            text: "Contributing",
            link: "https://github.com/alchemyplatform/aa-sdk/blob/main/CONTRIBUTING.md"
          }
        ]
      }
    ],
    search: {
      provider: "algolia",
      options: {
        appId: "IHLWJWIZ3J",
        apiKey: "e27b06dcc3597664309c1ed9b8cb5470",
        indexName: "aa-sdk-staging"
      }
    },
    sidebar: [
      {
        text: "Overview",
        items: [
          { text: "Why Account Kit", link: "/why-account-kit" },
          { text: "Introduction", link: "/introduction" },
          { text: "Getting Started Guide", link: "/getting-started" },
          {
            text: "Packages Overview",
            link: "/package-overview"
          },
          {
            text: "Demos",
            link: "/demos"
          }
        ]
      },
      {
        text: "Choosing a Smart Account",
        base: "/smart-accounts",
        items: [
          { text: "Overview", link: "/overview" },
          {
            text: "Choosing a Smart Account",
            base: "/smart-accounts/accounts",
            collapsed: true,
            items: [
              {
                text: "Overview",
                link: "/choosing-a-smart-account"
              },
              { text: "Light Account Smart Contract", link: "/light-account" },
              {
                text: "Modular Account Smart Contract",
                link: "/modular-account"
              },
              { text: "Using Your Own Smart Account", link: "/using-your-own" },
              {
                text: "Deployment Addresses",
                link: "/deployment-addresses"
              }
            ]
          },
          {
            text: "Choosing a Signer",
            base: "/smart-accounts/signers",
            collapsed: true,
            items: [
              {
                text: "Overview",
                link: "/choosing-a-signer"
              },
              { text: "Magic Link", link: "/magic" },
              { text: "Web3Auth", link: "/web3auth" },
              { text: "Turnkey", link: "/turnkey" },
              { text: "Privy", link: "/privy" },
              { text: "Dynamic", link: "/dynamic" },
              { text: "Fireblocks", link: "/fireblocks" },
              { text: "Portal Integration Guide", link: "/portal" },
              { text: "Capsule Integration Guide", link: "/capsule" },
              { text: "Lit Protocol Integration Guide", link: "/lit" },
              {
                text: "Particle Network Integration Guide",
                link: "/particle-network"
              },
              { text: "EOA Integration Guide", link: "/eoa" },
              {
                text: "How to Use Your Own Account Signer",
                link: "/custom-signer"
              },
              { text: "Contributing Your Signer", link: "/contributing" }
            ]
          },
          { text: "Sponsoring Gas", link: "/sponsoring-gas" },
          { text: "Batching Transactions", link: "/batching-transactions" },
          { text: "Transferring Ownership", link: "/transferring-ownership" }
        ]
      },
      {
        text: "aa-core",
        base: "/packages/aa-core",
        collapsed: true,
        items: [
          {
            text: "Overview of aa-core",
            link: "/"
          },
          {
            text: "Provider",
            collapsed: true,
            base: "/packages/aa-core/provider",
            items: [
              {
                text: "Overview of SmartAccountProvider",
                link: "/introduction"
              },
              {
                text: "sendUserOperation",
                link: "/sendUserOperation"
              },
              {
                text: "buildUserOperation",
                link: "/buildUserOperation"
              },
              {
                text: "buildUserOperationFromTx",
                link: "/buildUserOperationFromTx"
              },
              {
                text: "waitForUserOperationTransaction",
                link: "/waitForUserOperationTransaction"
              },
              {
                text: "getUserOperationByHash",
                link: "/getUserOperationByHash"
              },
              {
                text: "getUserOperationReceipt",
                link: "/getUserOperationReceipt"
              },
              {
                text: "sendTransaction",
                link: "/sendTransaction"
              },
              {
                text: "sendTransactions",
                link: "/sendTransactions"
              },
              {
                text: "request",
                link: "/request"
              },
              {
                text: "signMessage",
                link: "/signMessage"
              },
              {
                text: "signTypedData",
                link: "/signTypedData"
              },
              {
                text: "signMessageWith6492",
                link: "/signMessageWith6492"
              },
              {
                text: "signTypedDataWith6492",
                link: "/signTypedDataWith6492"
              },
              {
                text: "getAddress",
                link: "/getAddress"
              },
              {
                text: "getEntryPointAddress",
                link: "/getEntryPointAddress"
              },
              {
                text: "isConnected",
                link: "/isConnected"
              },
              {
                text: "withPaymasterMiddleware",
                link: "/withPaymasterMiddleware"
              },
              {
                text: "withGasEstimator",
                link: "/withGasEstimator"
              },
              {
                text: "withFeeDataGetter",
                link: "/withFeeDataGetter"
              },
              {
                text: "withCustomMiddleware",
                link: "/withCustomMiddleware"
              },
              {
                text: "connect",
                link: "/connect"
              },
              {
                text: "disconnect",
                link: "/disconnect"
              },
              {
                text: "extend",
                link: "/extend"
              }
            ]
          },
          {
            text: "Accounts",
            base: "/packages/aa-core/accounts",
            collapsed: true,
            items: [
              {
                text: "Overview of SmartContractAccount",
                link: "/introduction"
              },
              {
                text: "Required Methods",
                collapsed: true,
                base: "/packages/aa-core/accounts/required",
                items: [
                  {
                    text: "getDummySignature",
                    link: "/getDummySignature"
                  },
                  {
                    text: "getAccountInitCode",
                    link: "/getAccountInitCode"
                  },
                  {
                    text: "signMessage",
                    link: "/signMessage"
                  },
                  {
                    text: "encodeExecute",
                    link: "/encodeExecute"
                  }
                ]
              },
              {
                text: "Optional Methods",
                collapsed: true,
                base: "/packages/aa-core/accounts/optional",
                items: [
                  {
                    text: "encodeBatchExecute",
                    link: "/encodeBatchExecute"
                  },
                  {
                    text: "signTypedData",
                    link: "/signTypedData"
                  },
                  {
                    text: "signMessageWith6492",
                    link: "/signMessageWith6492"
                  },
                  {
                    text: "signTypedDataWith6492",
                    link: "/signTypedDataWith6492"
                  }
                ]
              },
              {
                text: "Other Methods",
                collapsed: true,
                base: "/packages/aa-core/accounts/other",
                items: [
                  {
                    text: "getAddress",
                    link: "/getAddress"
                  },
                  {
                    text: "getNonce",
                    link: "/getNonce"
                  },
                  {
                    text: "getOwner",
                    link: "/getOwner"
                  },
                  {
                    text: "getDeploymentState",
                    link: "/getDeploymentState"
                  },
                  {
                    text: "isAccountDeployed",
                    link: "/isAccountDeployed"
                  },
                  {
                    text: "getFactoryAddress",
                    link: "/getFactoryAddress"
                  },
                  {
                    text: "getEntryPointAddress",
                    link: "/getEntryPointAddress"
                  }
                ]
              }
            ]
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
                    link: "/wrapSignatureWith6492"
                  },
                  {
                    text: "verifyEIP6492Signature",
                    link: "/verifyEIP6492Signature"
                  }
                ]
              }
            ]
          },
          {
            text: "Public Client",
            base: "/packages/aa-core/client",
            collapsed: true,
            items: [
              {
                text: "Overview of Public Client",
                link: "/"
              },
              {
                text: "Actions",
                collapsed: true,
                base: "/packages/aa-core/client/actions",
                items: [
                  {
                    text: "sendUserOperation",
                    link: "/sendUserOperation"
                  },
                  {
                    text: "estimateUserOperationGas",
                    link: "/estimateUserOperationGas"
                  },
                  {
                    text: "getUserOperationByHash",
                    link: "/getUserOperationByHash"
                  },
                  {
                    text: "getUserOperationReceipt",
                    link: "/getUserOperationReceipt"
                  },
                  {
                    text: "getSupportedEntryPoints",
                    link: "/getSupportedEntryPoints"
                  }
                ]
              },
              {
                text: "createPublicErc4337Client",
                link: "/createPublicErc4337Client"
              },
              {
                text: "createPublicErc4337FromClient",
                link: "/createPublicErc4337FromClient"
              },
              {
                text: "erc4337ClientActions",
                link: "/erc4337ClientActions"
              }
            ]
          },
          {
            text: "Utilities",
            base: "/packages/aa-core/utils",
            collapsed: true,
            items: [
              { text: "asyncPipe", link: "/asyncPipe" },
              {
                text: "convertChainIdToCoinType",
                link: "/convertChainIdToCoinType"
              },
              {
                text: "convertCoinTypeToChain",
                link: "/convertCoinTypeToChain"
              },
              {
                text: "convertCoinTypeToChainId",
                link: "/convertCoinTypeToChainId"
              },
              { text: "deepHexlify", link: "/deepHexlify" },
              { text: "defineReadOnly", link: "/defineReadOnly" },
              { text: "getChain", link: "/getChain" },
              {
                text: "getDefaultEntryPointAddress",
                link: "/getDefaultEntryPointAddress"
              },
              {
                text: "getDefaultSimpleAccountFactoryAddress",
                link: "/getDefaultSimpleAccountFactoryAddress"
              },
              {
                text: "getUserOperationHash",
                link: "/getUserOperationHash"
              },
              { text: "resolveProperties", link: "/resolveProperties" }
            ]
          }
        ]
      },
      {
        text: "aa-alchemy",
        base: "/packages/aa-alchemy",
        collapsed: true,
        items: [
          {
            text: "Overview of aa-alchemy",
            link: "/"
          },
          {
            text: "AlchemyProvider",
            base: "/packages/aa-alchemy/provider",
            collapsed: true,
            items: [
              {
                text: "Overview of AlchemyProvider",
                link: "/introduction"
              },
              { text: "gasEstimator", link: "/gasEstimator" },
              {
                text: "withAlchemyGasManager",
                link: "/withAlchemyGasManager"
              }
            ]
          },
          {
            text: "Middleware",
            base: "/packages/aa-alchemy/middleware",
            collapsed: true,
            items: [
              {
                text: "Overview of Middleware",
                link: "/introduction"
              },
              {
                text: "withAlchemyGasFeeEstimator",
                link: "/withAlchemyGasFeeEstimator"
              },
              {
                text: "withAlchemyGasManager",
                link: "/withAlchemyGasManager"
              }
            ]
          },
          {
            text: "Utils",
            collapsed: true,
            base: "/packages/aa-alchemy/utils",
            items: [
              {
                text: "Overview of Utils",
                link: "/introduction"
              },
              { text: "SupportedChains", link: "/supportedChains" }
            ]
          }
        ]
      },
      {
        text: "aa-accounts",
        collapsed: true,
        base: "/packages/aa-accounts",
        items: [
          {
            text: "Overview of aa-accounts",
            link: "/"
          },
          {
            text: "LightSmartContractAccount",
            collapsed: true,
            base: "/packages/aa-accounts/light-account",
            items: [
              {
                text: "Overview of LightSmartContractAccount",
                link: "/introduction"
              },
              {
                text: "signMessageWith6492",
                link: "/signMessageWith6492"
              },
              { text: "signTypedData", link: "/signTypedData" },
              {
                text: "signTypedDataWith6492",
                link: "/signTypedDataWith6492"
              },
              { text: "getOwnerAddress", link: "/getOwnerAddress" },
              {
                text: "encodeTransferOwnership",
                link: "/encodeTransferOwnership"
              },
              { text: "transferOwnership", link: "/transferOwnership" }
            ]
          },
          {
            text: "Utilities",
            collapsed: true,
            base: "/packages/aa-accounts/utils",
            items: [
              {
                text: "getDefaultLightAccountFactoryAddress",
                link: "/getDefaultLightAccountFactoryAddress"
              }
            ]
          },
          { text: "Contributing", link: "/contributing" }
        ]
      },
      {
        text: "aa-ethers",
        base: "/packages/aa-ethers",
        collapsed: true,
        items: [
          {
            text: "Overview of aa-ethers",
            link: "/"
          },
          {
            text: "EthersProviderAdapter",
            collapsed: true,
            base: "/packages/aa-ethers/provider-adapter",
            items: [
              {
                text: "Overview of EthersProviderAdapter",
                link: "/introduction"
              },
              {
                text: "send",
                link: "/send"
              },
              {
                text: "connectToAccount",
                link: "/connectToAccount"
              },
              {
                text: "getPublicErc4337Client",
                link: "/getPublicErc4337Client"
              },
              {
                text: "fromEthersProvider",
                link: "/fromEthersProvider"
              }
            ]
          },
          {
            text: "AccountSigner",
            collapsed: true,
            base: "/packages/aa-ethers/account-signer",
            items: [
              {
                text: "Overview of AccountSigner",
                link: "/introduction"
              },
              {
                text: "getAddress",
                link: "/getAddress"
              },
              {
                text: "signMessage",
                link: "/signMessage"
              },
              {
                text: "sendTransaction",
                link: "/sendTransaction"
              },
              {
                text: "getPublicErc4337Client",
                link: "/getPublicErc4337Client"
              },
              {
                text: "connect",
                link: "/connect"
              }
            ]
          },
          {
            text: "Utils",
            collapsed: true,
            base: "/packages/aa-ethers/utils",
            items: [
              {
                text: "Overview of Utils",
                link: "/introduction"
              },
              {
                text: "convertWalletToAccountSigner",
                link: "/convertWalletToAccountSigner"
              },
              {
                text: "convertEthersSignerToAccountSigner",
                link: "/convertEthersSignerToAccountSigner"
              }
            ]
          }
        ]
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/alchemyplatform/aa-sdk" }
    ]
  },
  head: [
    [
      "script",
      {
        src: "https://static.alchemyapi.io/scripts/anayltics/alchemy-analytics.js",
        defer: "defer"
      }
    ],
    ["link", { rel: "icon", href: "/favicon.ico" }],
    // Open Graph tags
    ["meta", { property: "og:title", content: "Account Kit" }],
    [
      "meta",
      {
        property: "og:description",
        content: "Account Kit is a framework to embed smart accounts in your web3 app, unlocking powerful features like email/social login, gas sponsorship, batched transactions, and more."
      }
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
        content: "Account Kit is a framework to embed smart accounts in your web3 app, unlocking powerful features like email/social login, gas sponsorship, batched transactions, and more."
      }
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://github-production-user-asset-6210df.s3.amazonaws.com/83442423/274634864-34ec38a9-3de2-4075-9723-e998fa8aa7d8.jpg"
      }
    ]
  ],
  sitemap: {
    hostname: "https://accountkit.alchemy.com"
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbGVybmEuanNvbiIsICIudml0ZXByZXNzL2NvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsie1xuICBcIiRzY2hlbWFcIjogXCJub2RlX21vZHVsZXMvbGVybmEvc2NoZW1hcy9sZXJuYS1zY2hlbWEuanNvblwiLFxuICBcInVzZVdvcmtzcGFjZXNcIjogdHJ1ZSxcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4xLjFcIixcbiAgXCJ1c2VOeFwiOiB0cnVlLFxuICBcIm5wbUNsaWVudFwiOiBcInlhcm5cIixcbiAgXCJjb252ZW50aW9uYWxDb21taXRzXCI6IHRydWUsXG4gIFwiY2hhbmdlbG9nXCI6IHRydWUsXG4gIFwiY29tbWFuZFwiOiB7XG4gICAgXCJ2ZXJzaW9uXCI6IHtcbiAgICAgIFwibWVzc2FnZVwiOiBcImNob3JlKHJlbGVhc2UpOiBwdWJsaXNoICVzIFtza2lwLWNpXVwiXG4gICAgfVxuICB9LFxuICBcImdyYW51bGFyUGF0aHNwZWNcIjogZmFsc2Vcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2FqYXl2YXNpc2h0L0Rlc2t0b3AvYWxjaGVteS9hYS1zZGsvc2l0ZS8udml0ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYWpheXZhc2lzaHQvRGVza3RvcC9hbGNoZW15L2FhLXNkay9zaXRlLy52aXRlcHJlc3MvY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hamF5dmFzaXNodC9EZXNrdG9wL2FsY2hlbXkvYWEtc2RrL3NpdGUvLnZpdGVwcmVzcy9jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXByZXNzXCI7XG5cbmNvbnN0IHBrZyA9IHJlcXVpcmUoXCIuLi8uLi9sZXJuYS5qc29uXCIpO1xuXG4vLyBodHRwczovL3ZpdGVwcmVzcy5kZXYvcmVmZXJlbmNlL3NpdGUtY29uZmlnXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICB0aXRsZTogXCJBY2NvdW50IEtpdFwiLFxuICBkZXNjcmlwdGlvbjogXCJBY2NvdW50IEFic3RyYWN0aW9uIExlZ29zXCIsXG4gIHRoZW1lQ29uZmlnOiB7XG4gICAgbG9nbzogXCIva2l0LWxvZ28uc3ZnXCIsXG4gICAgLy8gaHR0cHM6Ly92aXRlcHJlc3MuZGV2L3JlZmVyZW5jZS9kZWZhdWx0LXRoZW1lLWNvbmZpZ1xuICAgIG5hdjogW1xuICAgICAgeyB0ZXh0OiBcIkRvY3NcIiwgbGluazogXCIvZ2V0dGluZy1zdGFydGVkXCIgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDogXCJFeGFtcGxlc1wiLFxuICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hbGNoZW15cGxhdGZvcm0vYWEtc2RrL3RyZWUvbWFpbi9leGFtcGxlc1wiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDogcGtnLnZlcnNpb24sXG4gICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJDaGFuZ2Vsb2dcIixcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2FsY2hlbXlwbGF0Zm9ybS9hYS1zZGsvYmxvYi9tYWluL0NIQU5HRUxPRy5tZFwiLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJDb250cmlidXRpbmdcIixcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2FsY2hlbXlwbGF0Zm9ybS9hYS1zZGsvYmxvYi9tYWluL0NPTlRSSUJVVElORy5tZFwiLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIF0sXG5cbiAgICBzZWFyY2g6IHtcbiAgICAgIHByb3ZpZGVyOiBcImFsZ29saWFcIixcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgYXBwSWQ6IFwiSUhMV0pXSVozSlwiLFxuICAgICAgICBhcGlLZXk6IFwiZTI3YjA2ZGNjMzU5NzY2NDMwOWMxZWQ5YjhjYjU0NzBcIixcbiAgICAgICAgaW5kZXhOYW1lOiBcImFhLXNkay1zdGFnaW5nXCIsXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICBzaWRlYmFyOiBbXG4gICAgICB7XG4gICAgICAgIHRleHQ6IFwiT3ZlcnZpZXdcIixcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICB7IHRleHQ6IFwiV2h5IEFjY291bnQgS2l0XCIsIGxpbms6IFwiL3doeS1hY2NvdW50LWtpdFwiIH0sXG4gICAgICAgICAgeyB0ZXh0OiBcIkludHJvZHVjdGlvblwiLCBsaW5rOiBcIi9pbnRyb2R1Y3Rpb25cIiB9LFxuICAgICAgICAgIHsgdGV4dDogXCJHZXR0aW5nIFN0YXJ0ZWQgR3VpZGVcIiwgbGluazogXCIvZ2V0dGluZy1zdGFydGVkXCIgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIlBhY2thZ2VzIE92ZXJ2aWV3XCIsXG4gICAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlLW92ZXJ2aWV3XCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIkRlbW9zXCIsXG4gICAgICAgICAgICBsaW5rOiBcIi9kZW1vc1wiLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0ZXh0OiBcIkNob29zaW5nIGEgU21hcnQgQWNjb3VudFwiLFxuICAgICAgICBiYXNlOiBcIi9zbWFydC1hY2NvdW50c1wiLFxuICAgICAgICBpdGVtczogW1xuICAgICAgICAgIHsgdGV4dDogXCJPdmVydmlld1wiLCBsaW5rOiBcIi9vdmVydmlld1wiIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJDaG9vc2luZyBhIFNtYXJ0IEFjY291bnRcIixcbiAgICAgICAgICAgIGJhc2U6IFwiL3NtYXJ0LWFjY291bnRzL2FjY291bnRzXCIsXG4gICAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJPdmVydmlld1wiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2Nob29zaW5nLWEtc21hcnQtYWNjb3VudFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwiTGlnaHQgQWNjb3VudCBTbWFydCBDb250cmFjdFwiLCBsaW5rOiBcIi9saWdodC1hY2NvdW50XCIgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiTW9kdWxhciBBY2NvdW50IFNtYXJ0IENvbnRyYWN0XCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvbW9kdWxhci1hY2NvdW50XCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJVc2luZyBZb3VyIE93biBTbWFydCBBY2NvdW50XCIsIGxpbms6IFwiL3VzaW5nLXlvdXItb3duXCIgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiRGVwbG95bWVudCBBZGRyZXNzZXNcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9kZXBsb3ltZW50LWFkZHJlc3Nlc1wiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IFwiQ2hvb3NpbmcgYSBTaWduZXJcIixcbiAgICAgICAgICAgIGJhc2U6IFwiL3NtYXJ0LWFjY291bnRzL3NpZ25lcnNcIixcbiAgICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIk92ZXJ2aWV3XCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvY2hvb3NpbmctYS1zaWduZXJcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgeyB0ZXh0OiBcIk1hZ2ljIExpbmtcIiwgbGluazogXCIvbWFnaWNcIiB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwiV2ViM0F1dGhcIiwgbGluazogXCIvd2ViM2F1dGhcIiB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwiVHVybmtleVwiLCBsaW5rOiBcIi90dXJua2V5XCIgfSxcbiAgICAgICAgICAgICAgeyB0ZXh0OiBcIlByaXZ5XCIsIGxpbms6IFwiL3ByaXZ5XCIgfSxcbiAgICAgICAgICAgICAgeyB0ZXh0OiBcIkR5bmFtaWNcIiwgbGluazogXCIvZHluYW1pY1wiIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJGaXJlYmxvY2tzXCIsIGxpbms6IFwiL2ZpcmVibG9ja3NcIiB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwiUG9ydGFsIEludGVncmF0aW9uIEd1aWRlXCIsIGxpbms6IFwiL3BvcnRhbFwiIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJDYXBzdWxlIEludGVncmF0aW9uIEd1aWRlXCIsIGxpbms6IFwiL2NhcHN1bGVcIiB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwiTGl0IFByb3RvY29sIEludGVncmF0aW9uIEd1aWRlXCIsIGxpbms6IFwiL2xpdFwiIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIlBhcnRpY2xlIE5ldHdvcmsgSW50ZWdyYXRpb24gR3VpZGVcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9wYXJ0aWNsZS1uZXR3b3JrXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJFT0EgSW50ZWdyYXRpb24gR3VpZGVcIiwgbGluazogXCIvZW9hXCIgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiSG93IHRvIFVzZSBZb3VyIE93biBBY2NvdW50IFNpZ25lclwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2N1c3RvbS1zaWduZXJcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgeyB0ZXh0OiBcIkNvbnRyaWJ1dGluZyBZb3VyIFNpZ25lclwiLCBsaW5rOiBcIi9jb250cmlidXRpbmdcIiB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsgdGV4dDogXCJTcG9uc29yaW5nIEdhc1wiLCBsaW5rOiBcIi9zcG9uc29yaW5nLWdhc1wiIH0sXG4gICAgICAgICAgeyB0ZXh0OiBcIkJhdGNoaW5nIFRyYW5zYWN0aW9uc1wiLCBsaW5rOiBcIi9iYXRjaGluZy10cmFuc2FjdGlvbnNcIiB9LFxuICAgICAgICAgIHsgdGV4dDogXCJUcmFuc2ZlcnJpbmcgT3duZXJzaGlwXCIsIGxpbms6IFwiL3RyYW5zZmVycmluZy1vd25lcnNoaXBcIiB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDogXCJhYS1jb3JlXCIsXG4gICAgICAgIGJhc2U6IFwiL3BhY2thZ2VzL2FhLWNvcmVcIixcbiAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICBpdGVtczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IFwiT3ZlcnZpZXcgb2YgYWEtY29yZVwiLFxuICAgICAgICAgICAgbGluazogXCIvXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIlByb3ZpZGVyXCIsXG4gICAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgICBiYXNlOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3Byb3ZpZGVyXCIsXG4gICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJPdmVydmlldyBvZiBTbWFydEFjY291bnRQcm92aWRlclwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2ludHJvZHVjdGlvblwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJzZW5kVXNlck9wZXJhdGlvblwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL3NlbmRVc2VyT3BlcmF0aW9uXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcImJ1aWxkVXNlck9wZXJhdGlvblwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2J1aWxkVXNlck9wZXJhdGlvblwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJidWlsZFVzZXJPcGVyYXRpb25Gcm9tVHhcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9idWlsZFVzZXJPcGVyYXRpb25Gcm9tVHhcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwid2FpdEZvclVzZXJPcGVyYXRpb25UcmFuc2FjdGlvblwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL3dhaXRGb3JVc2VyT3BlcmF0aW9uVHJhbnNhY3Rpb25cIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0VXNlck9wZXJhdGlvbkJ5SGFzaFwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2dldFVzZXJPcGVyYXRpb25CeUhhc2hcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0VXNlck9wZXJhdGlvblJlY2VpcHRcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9nZXRVc2VyT3BlcmF0aW9uUmVjZWlwdFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJzZW5kVHJhbnNhY3Rpb25cIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9zZW5kVHJhbnNhY3Rpb25cIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwic2VuZFRyYW5zYWN0aW9uc1wiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL3NlbmRUcmFuc2FjdGlvbnNcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwicmVxdWVzdFwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL3JlcXVlc3RcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwic2lnbk1lc3NhZ2VcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9zaWduTWVzc2FnZVwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJzaWduVHlwZWREYXRhXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvc2lnblR5cGVkRGF0YVwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJzaWduTWVzc2FnZVdpdGg2NDkyXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvc2lnbk1lc3NhZ2VXaXRoNjQ5MlwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJzaWduVHlwZWREYXRhV2l0aDY0OTJcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9zaWduVHlwZWREYXRhV2l0aDY0OTJcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0QWRkcmVzc1wiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2dldEFkZHJlc3NcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0RW50cnlQb2ludEFkZHJlc3NcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9nZXRFbnRyeVBvaW50QWRkcmVzc1wiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJpc0Nvbm5lY3RlZFwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2lzQ29ubmVjdGVkXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIndpdGhQYXltYXN0ZXJNaWRkbGV3YXJlXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvd2l0aFBheW1hc3Rlck1pZGRsZXdhcmVcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwid2l0aEdhc0VzdGltYXRvclwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL3dpdGhHYXNFc3RpbWF0b3JcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwid2l0aEZlZURhdGFHZXR0ZXJcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi93aXRoRmVlRGF0YUdldHRlclwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJ3aXRoQ3VzdG9tTWlkZGxld2FyZVwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL3dpdGhDdXN0b21NaWRkbGV3YXJlXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcImNvbm5lY3RcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9jb25uZWN0XCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcImRpc2Nvbm5lY3RcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9kaXNjb25uZWN0XCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcImV4dGVuZFwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2V4dGVuZFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IFwiQWNjb3VudHNcIixcbiAgICAgICAgICAgIGJhc2U6IFwiL3BhY2thZ2VzL2FhLWNvcmUvYWNjb3VudHNcIixcbiAgICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIk92ZXJ2aWV3IG9mIFNtYXJ0Q29udHJhY3RBY2NvdW50XCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvaW50cm9kdWN0aW9uXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIlJlcXVpcmVkIE1ldGhvZHNcIixcbiAgICAgICAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgYmFzZTogXCIvcGFja2FnZXMvYWEtY29yZS9hY2NvdW50cy9yZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0RHVtbXlTaWduYXR1cmVcIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCIvZ2V0RHVtbXlTaWduYXR1cmVcIixcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0QWNjb3VudEluaXRDb2RlXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2dldEFjY291bnRJbml0Q29kZVwiLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJzaWduTWVzc2FnZVwiLFxuICAgICAgICAgICAgICAgICAgICBsaW5rOiBcIi9zaWduTWVzc2FnZVwiLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJlbmNvZGVFeGVjdXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2VuY29kZUV4ZWN1dGVcIixcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiT3B0aW9uYWwgTWV0aG9kc1wiLFxuICAgICAgICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBiYXNlOiBcIi9wYWNrYWdlcy9hYS1jb3JlL2FjY291bnRzL29wdGlvbmFsXCIsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJlbmNvZGVCYXRjaEV4ZWN1dGVcIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCIvZW5jb2RlQmF0Y2hFeGVjdXRlXCIsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcInNpZ25UeXBlZERhdGFcIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCIvc2lnblR5cGVkRGF0YVwiLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJzaWduTWVzc2FnZVdpdGg2NDkyXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL3NpZ25NZXNzYWdlV2l0aDY0OTJcIixcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwic2lnblR5cGVkRGF0YVdpdGg2NDkyXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL3NpZ25UeXBlZERhdGFXaXRoNjQ5MlwiLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJPdGhlciBNZXRob2RzXCIsXG4gICAgICAgICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGJhc2U6IFwiL3BhY2thZ2VzL2FhLWNvcmUvYWNjb3VudHMvb3RoZXJcIixcbiAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldEFkZHJlc3NcIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCIvZ2V0QWRkcmVzc1wiLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXROb25jZVwiLFxuICAgICAgICAgICAgICAgICAgICBsaW5rOiBcIi9nZXROb25jZVwiLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRPd25lclwiLFxuICAgICAgICAgICAgICAgICAgICBsaW5rOiBcIi9nZXRPd25lclwiLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXREZXBsb3ltZW50U3RhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCIvZ2V0RGVwbG95bWVudFN0YXRlXCIsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcImlzQWNjb3VudERlcGxveWVkXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2lzQWNjb3VudERlcGxveWVkXCIsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldEZhY3RvcnlBZGRyZXNzXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2dldEZhY3RvcnlBZGRyZXNzXCIsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcImdldEVudHJ5UG9pbnRBZGRyZXNzXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2dldEVudHJ5UG9pbnRBZGRyZXNzXCIsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJTaWduZXJzXCIsXG4gICAgICAgICAgICBiYXNlOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NpZ25lcnNcIixcbiAgICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJXYWxsZXRDbGllbnRTaWduZXJcIiwgbGluazogXCIvd2FsbGV0LWNsaWVudFwiIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJMb2NhbEFjY291bnRTaWduZXJcIiwgbGluazogXCIvbG9jYWwtYWNjb3VudFwiIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIlV0aWxzXCIsXG4gICAgICAgICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGJhc2U6IFwiL3BhY2thZ2VzL2FhLWNvcmUvc2lnbmVycy91dGlsc1wiLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwid3JhcFNpZ25hdHVyZVdpdGg2NDkyXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL3dyYXBTaWduYXR1cmVXaXRoNjQ5MlwiLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJ2ZXJpZnlFSVA2NDkyU2lnbmF0dXJlXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL3ZlcmlmeUVJUDY0OTJTaWduYXR1cmVcIixcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIlB1YmxpYyBDbGllbnRcIixcbiAgICAgICAgICAgIGJhc2U6IFwiL3BhY2thZ2VzL2FhLWNvcmUvY2xpZW50XCIsXG4gICAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJPdmVydmlldyBvZiBQdWJsaWMgQ2xpZW50XCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIkFjdGlvbnNcIixcbiAgICAgICAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgYmFzZTogXCIvcGFja2FnZXMvYWEtY29yZS9jbGllbnQvYWN0aW9uc1wiLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwic2VuZFVzZXJPcGVyYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCIvc2VuZFVzZXJPcGVyYXRpb25cIixcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZXN0aW1hdGVVc2VyT3BlcmF0aW9uR2FzXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2VzdGltYXRlVXNlck9wZXJhdGlvbkdhc1wiLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJnZXRVc2VyT3BlcmF0aW9uQnlIYXNoXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2dldFVzZXJPcGVyYXRpb25CeUhhc2hcIixcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0VXNlck9wZXJhdGlvblJlY2VpcHRcIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCIvZ2V0VXNlck9wZXJhdGlvblJlY2VpcHRcIixcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0U3VwcG9ydGVkRW50cnlQb2ludHNcIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCIvZ2V0U3VwcG9ydGVkRW50cnlQb2ludHNcIixcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiY3JlYXRlUHVibGljRXJjNDMzN0NsaWVudFwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2NyZWF0ZVB1YmxpY0VyYzQzMzdDbGllbnRcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiY3JlYXRlUHVibGljRXJjNDMzN0Zyb21DbGllbnRcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9jcmVhdGVQdWJsaWNFcmM0MzM3RnJvbUNsaWVudFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJlcmM0MzM3Q2xpZW50QWN0aW9uc1wiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2VyYzQzMzdDbGllbnRBY3Rpb25zXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJVdGlsaXRpZXNcIixcbiAgICAgICAgICAgIGJhc2U6IFwiL3BhY2thZ2VzL2FhLWNvcmUvdXRpbHNcIixcbiAgICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJhc3luY1BpcGVcIiwgbGluazogXCIvYXN5bmNQaXBlXCIgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiY29udmVydENoYWluSWRUb0NvaW5UeXBlXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvY29udmVydENoYWluSWRUb0NvaW5UeXBlXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcImNvbnZlcnRDb2luVHlwZVRvQ2hhaW5cIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9jb252ZXJ0Q29pblR5cGVUb0NoYWluXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcImNvbnZlcnRDb2luVHlwZVRvQ2hhaW5JZFwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2NvbnZlcnRDb2luVHlwZVRvQ2hhaW5JZFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwiZGVlcEhleGxpZnlcIiwgbGluazogXCIvZGVlcEhleGxpZnlcIiB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwiZGVmaW5lUmVhZE9ubHlcIiwgbGluazogXCIvZGVmaW5lUmVhZE9ubHlcIiB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwiZ2V0Q2hhaW5cIiwgbGluazogXCIvZ2V0Q2hhaW5cIiB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJnZXREZWZhdWx0RW50cnlQb2ludEFkZHJlc3NcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9nZXREZWZhdWx0RW50cnlQb2ludEFkZHJlc3NcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0RGVmYXVsdFNpbXBsZUFjY291bnRGYWN0b3J5QWRkcmVzc1wiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2dldERlZmF1bHRTaW1wbGVBY2NvdW50RmFjdG9yeUFkZHJlc3NcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0VXNlck9wZXJhdGlvbkhhc2hcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9nZXRVc2VyT3BlcmF0aW9uSGFzaFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwicmVzb2x2ZVByb3BlcnRpZXNcIiwgbGluazogXCIvcmVzb2x2ZVByb3BlcnRpZXNcIiB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDogXCJhYS1hbGNoZW15XCIsXG4gICAgICAgIGJhc2U6IFwiL3BhY2thZ2VzL2FhLWFsY2hlbXlcIixcbiAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICBpdGVtczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IFwiT3ZlcnZpZXcgb2YgYWEtYWxjaGVteVwiLFxuICAgICAgICAgICAgbGluazogXCIvXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIkFsY2hlbXlQcm92aWRlclwiLFxuICAgICAgICAgICAgYmFzZTogXCIvcGFja2FnZXMvYWEtYWxjaGVteS9wcm92aWRlclwiLFxuICAgICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiT3ZlcnZpZXcgb2YgQWxjaGVteVByb3ZpZGVyXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvaW50cm9kdWN0aW9uXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJnYXNFc3RpbWF0b3JcIiwgbGluazogXCIvZ2FzRXN0aW1hdG9yXCIgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwid2l0aEFsY2hlbXlHYXNNYW5hZ2VyXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvd2l0aEFsY2hlbXlHYXNNYW5hZ2VyXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJNaWRkbGV3YXJlXCIsXG4gICAgICAgICAgICBiYXNlOiBcIi9wYWNrYWdlcy9hYS1hbGNoZW15L21pZGRsZXdhcmVcIixcbiAgICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIk92ZXJ2aWV3IG9mIE1pZGRsZXdhcmVcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9pbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwid2l0aEFsY2hlbXlHYXNGZWVFc3RpbWF0b3JcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi93aXRoQWxjaGVteUdhc0ZlZUVzdGltYXRvclwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJ3aXRoQWxjaGVteUdhc01hbmFnZXJcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi93aXRoQWxjaGVteUdhc01hbmFnZXJcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIlV0aWxzXCIsXG4gICAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgICBiYXNlOiBcIi9wYWNrYWdlcy9hYS1hbGNoZW15L3V0aWxzXCIsXG4gICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJPdmVydmlldyBvZiBVdGlsc1wiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2ludHJvZHVjdGlvblwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwiU3VwcG9ydGVkQ2hhaW5zXCIsIGxpbms6IFwiL3N1cHBvcnRlZENoYWluc1wiIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0ZXh0OiBcImFhLWFjY291bnRzXCIsXG4gICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgYmFzZTogXCIvcGFja2FnZXMvYWEtYWNjb3VudHNcIixcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIk92ZXJ2aWV3IG9mIGFhLWFjY291bnRzXCIsXG4gICAgICAgICAgICBsaW5rOiBcIi9cIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IFwiTGlnaHRTbWFydENvbnRyYWN0QWNjb3VudFwiLFxuICAgICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICAgICAgYmFzZTogXCIvcGFja2FnZXMvYWEtYWNjb3VudHMvbGlnaHQtYWNjb3VudFwiLFxuICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiT3ZlcnZpZXcgb2YgTGlnaHRTbWFydENvbnRyYWN0QWNjb3VudFwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2ludHJvZHVjdGlvblwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJzaWduTWVzc2FnZVdpdGg2NDkyXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvc2lnbk1lc3NhZ2VXaXRoNjQ5MlwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwic2lnblR5cGVkRGF0YVwiLCBsaW5rOiBcIi9zaWduVHlwZWREYXRhXCIgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwic2lnblR5cGVkRGF0YVdpdGg2NDkyXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvc2lnblR5cGVkRGF0YVdpdGg2NDkyXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJnZXRPd25lckFkZHJlc3NcIiwgbGluazogXCIvZ2V0T3duZXJBZGRyZXNzXCIgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiZW5jb2RlVHJhbnNmZXJPd25lcnNoaXBcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9lbmNvZGVUcmFuc2Zlck93bmVyc2hpcFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwidHJhbnNmZXJPd25lcnNoaXBcIiwgbGluazogXCIvdHJhbnNmZXJPd25lcnNoaXBcIiB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IFwiVXRpbGl0aWVzXCIsXG4gICAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgICBiYXNlOiBcIi9wYWNrYWdlcy9hYS1hY2NvdW50cy91dGlsc1wiLFxuICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiZ2V0RGVmYXVsdExpZ2h0QWNjb3VudEZhY3RvcnlBZGRyZXNzXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvZ2V0RGVmYXVsdExpZ2h0QWNjb3VudEZhY3RvcnlBZGRyZXNzXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgeyB0ZXh0OiBcIkNvbnRyaWJ1dGluZ1wiLCBsaW5rOiBcIi9jb250cmlidXRpbmdcIiB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDogXCJhYS1ldGhlcnNcIixcbiAgICAgICAgYmFzZTogXCIvcGFja2FnZXMvYWEtZXRoZXJzXCIsXG4gICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIk92ZXJ2aWV3IG9mIGFhLWV0aGVyc1wiLFxuICAgICAgICAgICAgbGluazogXCIvXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIkV0aGVyc1Byb3ZpZGVyQWRhcHRlclwiLFxuICAgICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICAgICAgYmFzZTogXCIvcGFja2FnZXMvYWEtZXRoZXJzL3Byb3ZpZGVyLWFkYXB0ZXJcIixcbiAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIk92ZXJ2aWV3IG9mIEV0aGVyc1Byb3ZpZGVyQWRhcHRlclwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2ludHJvZHVjdGlvblwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJzZW5kXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvc2VuZFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJjb25uZWN0VG9BY2NvdW50XCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvY29ubmVjdFRvQWNjb3VudFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJnZXRQdWJsaWNFcmM0MzM3Q2xpZW50XCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvZ2V0UHVibGljRXJjNDMzN0NsaWVudFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJmcm9tRXRoZXJzUHJvdmlkZXJcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9mcm9tRXRoZXJzUHJvdmlkZXJcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIkFjY291bnRTaWduZXJcIixcbiAgICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICAgIGJhc2U6IFwiL3BhY2thZ2VzL2FhLWV0aGVycy9hY2NvdW50LXNpZ25lclwiLFxuICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiT3ZlcnZpZXcgb2YgQWNjb3VudFNpZ25lclwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2ludHJvZHVjdGlvblwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJnZXRBZGRyZXNzXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvZ2V0QWRkcmVzc1wiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJzaWduTWVzc2FnZVwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL3NpZ25NZXNzYWdlXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcInNlbmRUcmFuc2FjdGlvblwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL3NlbmRUcmFuc2FjdGlvblwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJnZXRQdWJsaWNFcmM0MzM3Q2xpZW50XCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvZ2V0UHVibGljRXJjNDMzN0NsaWVudFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJjb25uZWN0XCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvY29ubmVjdFwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IFwiVXRpbHNcIixcbiAgICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICAgIGJhc2U6IFwiL3BhY2thZ2VzL2FhLWV0aGVycy91dGlsc1wiLFxuICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiT3ZlcnZpZXcgb2YgVXRpbHNcIixcbiAgICAgICAgICAgICAgICBsaW5rOiBcIi9pbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiY29udmVydFdhbGxldFRvQWNjb3VudFNpZ25lclwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2NvbnZlcnRXYWxsZXRUb0FjY291bnRTaWduZXJcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiY29udmVydEV0aGVyc1NpZ25lclRvQWNjb3VudFNpZ25lclwiLFxuICAgICAgICAgICAgICAgIGxpbms6IFwiL2NvbnZlcnRFdGhlcnNTaWduZXJUb0FjY291bnRTaWduZXJcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXSxcblxuICAgIHNvY2lhbExpbmtzOiBbXG4gICAgICB7IGljb246IFwiZ2l0aHViXCIsIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2FsY2hlbXlwbGF0Zm9ybS9hYS1zZGtcIiB9LFxuICAgIF0sXG4gIH0sXG4gIGhlYWQ6IFtcbiAgICBbXG4gICAgICBcInNjcmlwdFwiLFxuICAgICAge1xuICAgICAgICBzcmM6IFwiaHR0cHM6Ly9zdGF0aWMuYWxjaGVteWFwaS5pby9zY3JpcHRzL2FuYXlsdGljcy9hbGNoZW15LWFuYWx5dGljcy5qc1wiLFxuICAgICAgICBkZWZlcjogXCJkZWZlclwiLFxuICAgICAgfSxcbiAgICBdLFxuICAgIFtcImxpbmtcIiwgeyByZWw6IFwiaWNvblwiLCBocmVmOiBcIi9mYXZpY29uLmljb1wiIH1dLFxuXG4gICAgLy8gT3BlbiBHcmFwaCB0YWdzXG4gICAgW1wibWV0YVwiLCB7IHByb3BlcnR5OiBcIm9nOnRpdGxlXCIsIGNvbnRlbnQ6IFwiQWNjb3VudCBLaXRcIiB9XSxcbiAgICBbXG4gICAgICBcIm1ldGFcIixcbiAgICAgIHtcbiAgICAgICAgcHJvcGVydHk6IFwib2c6ZGVzY3JpcHRpb25cIixcbiAgICAgICAgY29udGVudDpcbiAgICAgICAgICBcIkFjY291bnQgS2l0IGlzIGEgZnJhbWV3b3JrIHRvIGVtYmVkIHNtYXJ0IGFjY291bnRzIGluIHlvdXIgd2ViMyBhcHAsIHVubG9ja2luZyBwb3dlcmZ1bCBmZWF0dXJlcyBsaWtlIGVtYWlsL3NvY2lhbCBsb2dpbiwgZ2FzIHNwb25zb3JzaGlwLCBiYXRjaGVkIHRyYW5zYWN0aW9ucywgYW5kIG1vcmUuXCIsXG4gICAgICB9LFxuICAgIF0sXG4gICAgW1wibWV0YVwiLCB7IHByb3BlcnR5OiBcIm9nOmltYWdlXCIsIGNvbnRlbnQ6IFwiL2ltYWdlcy9vZy1pbWFnZS5qcGdcIiB9XSxcbiAgICBbXCJtZXRhXCIsIHsgcHJvcGVydHk6IFwib2c6aW1hZ2U6dHlwZVwiLCBjb250ZW50OiBcImltYWdlL2pwZWdcIiB9XSxcbiAgICBbXCJtZXRhXCIsIHsgcHJvcGVydHk6IFwib2c6aW1hZ2U6d2lkdGhcIiwgY29udGVudDogXCIyNDAwXCIgfV0sXG4gICAgW1wibWV0YVwiLCB7IHByb3BlcnR5OiBcIm9nOmltYWdlOmhlaWdodFwiLCBjb250ZW50OiBcIjEyNjBcIiB9XSxcblxuICAgIC8vIFR3aXR0ZXIgQ2FyZCB0YWdzXG4gICAgW1wibWV0YVwiLCB7IG5hbWU6IFwidHdpdHRlcjpjYXJkXCIsIGNvbnRlbnQ6IFwic3VtbWFyeV9sYXJnZV9pbWFnZVwiIH1dLFxuICAgIFtcIm1ldGFcIiwgeyBuYW1lOiBcInR3aXR0ZXI6dGl0bGVcIiwgY29udGVudDogXCJBY2NvdW50IEtpdFwiIH1dLFxuICAgIFtcbiAgICAgIFwibWV0YVwiLFxuICAgICAge1xuICAgICAgICBuYW1lOiBcInR3aXR0ZXI6ZGVzY3JpcHRpb25cIixcbiAgICAgICAgY29udGVudDpcbiAgICAgICAgICBcIkFjY291bnQgS2l0IGlzIGEgZnJhbWV3b3JrIHRvIGVtYmVkIHNtYXJ0IGFjY291bnRzIGluIHlvdXIgd2ViMyBhcHAsIHVubG9ja2luZyBwb3dlcmZ1bCBmZWF0dXJlcyBsaWtlIGVtYWlsL3NvY2lhbCBsb2dpbiwgZ2FzIHNwb25zb3JzaGlwLCBiYXRjaGVkIHRyYW5zYWN0aW9ucywgYW5kIG1vcmUuXCIsXG4gICAgICB9LFxuICAgIF0sXG4gICAgW1xuICAgICAgXCJtZXRhXCIsXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwidHdpdHRlcjppbWFnZVwiLFxuICAgICAgICBjb250ZW50OlxuICAgICAgICAgIFwiaHR0cHM6Ly9naXRodWItcHJvZHVjdGlvbi11c2VyLWFzc2V0LTYyMTBkZi5zMy5hbWF6b25hd3MuY29tLzgzNDQyNDIzLzI3NDYzNDg2NC0zNGVjMzhhOS0zZGUyLTQwNzUtOTcyMy1lOTk4ZmE4YWE3ZDguanBnXCIsXG4gICAgICB9LFxuICAgIF0sXG4gIF0sXG4gIHNpdGVtYXA6IHtcbiAgICBob3N0bmFtZTogXCJodHRwczovL2FjY291bnRraXQuYWxjaGVteS5jb21cIixcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFDRSxTQUFXO0FBQUEsTUFDWCxlQUFpQjtBQUFBLE1B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QUNBO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLE1BQU07QUFBQSxjQUNSO0FBQUEsY0FDQTtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixNQUFNO0FBQUEsY0FDUjtBQUFBLGNBQ0E7QUFBQSxnQkFDRSxNQUFNO0FBQUEsZ0JBQ04sTUFBTTtBQUFBLGNBQ1I7QUFBQSxjQUNBO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLE1BQU07QUFBQSxjQUNSO0FBQUEsY0FDQTtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixNQUFNO0FBQUEsY0FDUjtBQUFBLGNBQ0E7QUFBQSxnQkFDRSxNQUFNO0FBQUEsZ0JBQ04sTUFBTTtBQUFBLGNBQ1I7QUFBQSxjQUNBO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLE1BQU07QUFBQSxjQUNSO0FBQUEsY0FDQTtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixNQUFNO0FBQUEsY0FDUjtBQUFBLGNBQ0E7QUFBQSxnQkFDRSxNQUFNO0FBQUEsZ0JBQ04sTUFBTTtBQUFBLGNBQ1I7QUFBQSxjQUNBO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLE1BQU07QUFBQSxjQUNSO0FBQUEsY0FDQTtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixNQUFNO0FBQUEsY0FDUjtBQUFBLGNBQ0E7QUFBQSxnQkFDRSxNQUFNO0FBQUEsZ0JBQ04sTUFBTTtBQUFBLGNBQ1I7QUFBQSxjQUNBO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLE1BQU07QUFBQSxjQUNSO0FBQUEsY0FDQTtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixNQUFNO0FBQUEsY0FDUjtBQUFBLGNBQ0E7QUFBQSxnQkFDRSxNQUFNO0FBQUEsZ0JBQ04sTUFBTTtBQUFBLGNBQ1I7QUFBQSxjQUNBO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLE1BQU07QUFBQSxjQUNSO0FBQUEsY0FDQTtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixNQUFNO0FBQUEsY0FDUjtBQUFBLGNBQ0E7QUFBQSxnQkFDRSxN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LGNBQ3RDO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLE1BQU07QUFBQSxjQUNSO0FBQUEsY0FDQTtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixNQUFNO0FBQUEsY0FDUjtBQUFBLGNBQ0E7QUFBQSxnQkFDRSxNQUFNO0FBQUEsZ0JBQ04sTUFBTTtBQUFBLGNBQ1I7QUFBQSxjQUNBLEVBQUUsTUFBTSxxQkFBcUIsTUFBTSxxQkFBcUI7QUFBQSxZQUMxRDtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLE1BQU07QUFBQSxZQUNOLFdBQVc7QUFBQSxZQUNYLE9BQU87QUFBQSxjQUNMO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLE1BQU07QUFBQSxjQUNSO0FBQUEsY0FDQSxFQUFFLE1BQU0sZ0JBQWdCLE1BQU0sZ0JBQWdCO0FBQUEsY0FDOUM7QUFBQSxnQkFDRSxNQUFNO0FBQUEsZ0JBQ04sTUFBTTtBQUFBLGNBQ1I7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFVBQ0E7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLE1BQU07QUFBQSxZQUNOLFdBQVc7QUFBQSxZQUNYLE9BQU87QUFBQSxjQUNMO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLE1BQU07QUFBQSxjQUNSO0FBQUEsY0FDQTtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixNQUFNO0FBQUEsY0FDUjtBQUFBLGNBQ0E7QUFBQSxnQkFDRSxNQUFNO0FBQUEsZ0JBQ04sTUFBTTtBQUFBLGNBQ1I7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFVBQ0E7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFdBQVc7QUFBQSxZQUNYLE1BQU07QUFBQSxZQUNOLE9B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
