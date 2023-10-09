import { $ } from "execa";
import { defineConfig } from "vitepress";

// This makes sure that this works in forked repos as well
const getRepoRoute = $.sync`git rev-parse --show-toplevel`;
const { stdout: basePath } = $.sync`basename ${getRepoRoute}`;

const noBasePath = process.env.NO_BASE_PATH === "true";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  base: noBasePath ? undefined : `/${basePath}`,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Docs", link: "/getting-started" },
      {
        text: "Examples",
        link: "https://github.com/alchemyplatform/aa-sdk/tree/main/examples",
      },
    ],

    search: {
      provider: "local",
    },

    sidebar: [
      { text: "Introduction", link: "/introduction" },
      { text: "Getting Started", link: "/getting-started" },
      {
        text: "Packages Overview",
        link: "/packages/overview",
      },
      {
        text: "Using Smart Accounts",
        base: "/smart-accounts",
        items: [
          { text: "Overview", link: "/overview" },
          {
            text: "Choosing a Smart Account",
            base: "/smart-accounts/accounts",
            link: "/overview",
            items: [
              { text: "Light Account", link: "/light-account" },
              { text: "Modular Account", link: "/modular-account" },
              { text: "Using Your Own", link: "/using-your-own" },
            ],
          },
          {
            text: "Choosing a Signer",
            base: "/smart-accounts/signers",
            link: "/overview",
            items: [
              { text: "Capsule", link: "/capsule" },
              { text: "Lit Protocol", link: "/lit" },
              { text: "Magic.Link", link: "/magic-link" },
              { text: "Portal", link: "/portal" },
              { text: "Privy", link: "/privy" },
              { text: "Turnkey", link: "/turnkey" },
              { text: "Web3Auth", link: "/web3auth" },
              { text: "Externally Owned Account", link: "/eoa" },
              { text: "Using Your Own", link: "/using-your-own" },
              { text: "Contributing", link: "/contributing" },
            ],
          },
          { text: "Sponsoring Gas", link: "/sponsoring-gas" },
          { text: "Batching Transactions", link: "/batching-transactions" },
          { text: "Transferring Ownership", link: "/transferring-ownership" },
        ],
      },
      { text: "ERC-6900", link: "/erc-6900" },
      // Per Package docs
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
                text: "dummyPaymasterDataMiddleware",
                link: "/dummyPaymasterDataMiddleware",
              },
              {
                text: "paymasterDataMiddleware",
                link: "/paymasterDataMiddleware",
              },
              {
                text: "gasEstimator",
                link: "/gasEstimator",
              },
              {
                text: "feeDataGetter",
                link: "/feeDataGetter",
              },
              {
                text: "customMiddleware",
                link: "/customMiddleware",
              },
            ],
          },
          { text: "Accounts" },
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
                  { text: "sendUserOperation", link: "/sendUserOperation" },
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
              { text: "getUserOperationHash", link: "/getUserOperationHash" },
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
              { text: "withAlchemyGasManager", link: "/withAlchemyGasManager" },
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
              { text: "withAlchemyGasManager", link: "/withAlchemyGasManager" },
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
              { text: "signMessageWith6492", link: "/signMessageWith6492" },
              { text: "signTypedData", link: "/signTypedData" },
              { text: "signTypedDataWith6492", link: "/signTypedDataWith6492" },
              { text: "getOwner", link: "/getOwner" },
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
});
