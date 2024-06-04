var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) =>
  function __require() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    );
  };

// ../lerna.json
var require_lerna = __commonJS({
  "../lerna.json"(exports, module) {
    module.exports = {
      $schema: "node_modules/lerna/schemas/lerna-schema.json",
      version: "3.17.0",
      npmClient: "yarn",
      conventionalCommits: true,
      changelog: true,
      command: {
        version: {
          message: "chore(release): publish %s [skip-ci]",
        },
      },
      granularPathspec: false,
    };
  },
});

// vocs.config.tsx
import { defineConfig } from "file:///home/runner/work/aa-sdk/aa-sdk/node_modules/vocs/_lib/index.js";

// sidebar/aa-accounts.ts
var aaAccountsSidebar = {
  text: "aa-accounts",
  collapsed: true,
  items: [
    {
      text: "Getting started",
      link: "/packages/aa-accounts/",
    },
    {
      text: "Light Account",
      link: "/packages/aa-accounts/light-account/",
    },
    {
      text: "Light Account Actions",
      collapsed: true,
      items: [
        {
          text: "transferOwnership",
          link: "/packages/aa-accounts/light-account/actions/transferOwnership",
        },
      ],
    },
    {
      text: "Light Account Client",
      link: "/packages/aa-accounts/light-account/client",
    },
    {
      text: "Utils",
      collapsed: true,
      items: [
        {
          text: "getDefaultLightAccountFactoryAddress",
          link: "/packages/aa-accounts/utils/getDefaultLightAccountFactoryAddress",
        },
      ],
    },
    { text: "Contributing", link: "/packages/aa-accounts/contributing" },
  ],
};

// sidebar/aa-alchemy.ts
var aaAlchemySidebar = {
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

// sidebar/aa-core.ts
var aaCoreSideBar = {
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

// sidebar/aa-ethers.ts
var aaEthersSidebar = {
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

// sidebar/aa-signers.ts
var aaSignersSidebar = {
  text: "aa-signers",
  collapsed: true,
  items: [
    {
      text: "Getting started",
      link: "/packages/aa-signers/",
    },
    {
      text: "Magic Signer",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-signers/magic/introduction",
        },
        { text: "constructor", link: "/packages/aa-signers/magic/constructor" },
        {
          text: "authenticate",
          link: "/packages/aa-signers/magic/authenticate",
        },
        { text: "getAddress", link: "/packages/aa-signers/magic/getAddress" },
        { text: "signMessage", link: "/packages/aa-signers/magic/signMessage" },
        {
          text: "signTypedData",
          link: "/packages/aa-signers/magic/signTypedData",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-signers/magic/getAuthDetails",
        },
      ],
    },
    {
      text: "Web3Auth Signer",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-signers/web3auth/introduction",
        },
        {
          text: "constructor",
          link: "/packages/aa-signers/web3auth/constructor",
        },
        {
          text: "authenticate",
          link: "/packages/aa-signers/web3auth/authenticate",
        },
        {
          text: "getAddress",
          link: "/packages/aa-signers/web3auth/getAddress",
        },
        {
          text: "signMessage",
          link: "/packages/aa-signers/web3auth/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-signers/web3auth/signTypedData",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-signers/web3auth/getAuthDetails",
        },
      ],
    },
    {
      text: "Turnkey Signer",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-signers/turnkey/introduction",
        },
        {
          text: "constructor",
          link: "/packages/aa-signers/turnkey/constructor",
        },
        {
          text: "authenticate",
          link: "/packages/aa-signers/turnkey/authenticate",
        },
        { text: "getAddress", link: "/packages/aa-signers/turnkey/getAddress" },
        {
          text: "signMessage",
          link: "/packages/aa-signers/turnkey/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-signers/turnkey/signTypedData",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-signers/turnkey/getAuthDetails",
        },
      ],
    },
    {
      text: "Fireblocks Signer",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-signers/fireblocks/introduction",
        },
        {
          text: "constructor",
          link: "/packages/aa-signers/fireblocks/constructor",
        },
        {
          text: "authenticate",
          link: "/packages/aa-signers/fireblocks/authenticate",
        },
        {
          text: "getAddress",
          link: "/packages/aa-signers/fireblocks/getAddress",
        },
        {
          text: "signMessage",
          link: "/packages/aa-signers/fireblocks/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-signers/fireblocks/signTypedData",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-signers/fireblocks/getAuthDetails",
        },
      ],
    },
    {
      text: "Capsule Signer",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-signers/capsule/introduction",
        },
        {
          text: "constructor",
          link: "/packages/aa-signers/capsule/constructor",
        },
        {
          text: "authenticate",
          link: "/packages/aa-signers/capsule/authenticate",
        },
        { text: "getAddress", link: "/packages/aa-signers/capsule/getAddress" },
        {
          text: "signMessage",
          link: "/packages/aa-signers/capsule/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-signers/capsule/signTypedData",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-signers/capsule/getAuthDetails",
        },
      ],
    },
    {
      text: "Particle Signer",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-signers/particle/introduction",
        },
        {
          text: "constructor",
          link: "/packages/aa-signers/particle/constructor",
        },
        {
          text: "authenticate",
          link: "/packages/aa-signers/particle/authenticate",
        },
        {
          text: "getAddress",
          link: "/packages/aa-signers/particle/getAddress",
        },
        {
          text: "signMessage",
          link: "/packages/aa-signers/particle/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-signers/particle/signTypedData",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-signers/particle/getAuthDetails",
        },
      ],
    },
    {
      text: "Portal Signer",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-signers/portal/introduction",
        },
        {
          text: "constructor",
          link: "/packages/aa-signers/portal/constructor",
        },
        {
          text: "authenticate",
          link: "/packages/aa-signers/portal/authenticate",
        },
        { text: "getAddress", link: "/packages/aa-signers/portal/getAddress" },
        {
          text: "signMessage",
          link: "/packages/aa-signers/portal/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-signers/portal/signTypedData",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-signers/portal/getAuthDetails",
        },
      ],
    },
    {
      text: "Arcana Auth Signer",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-signers/arcana-auth/introduction",
        },
        {
          text: "constructor",
          link: "/packages/aa-signers/arcana-auth/constructor",
        },
        {
          text: "authenticate",
          link: "/packages/aa-signers/arcana-auth/authenticate",
        },
        {
          text: "getAddress",
          link: "/packages/aa-signers/arcana-auth/getAddress",
        },
        {
          text: "signMessage",
          link: "/packages/aa-signers/arcana-auth/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-signers/arcana-auth/signTypedData",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-signers/arcana-auth/getAuthDetails",
        },
      ],
    },
    {
      text: "Lit Signer",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-signers/lit-protocol/introduction",
        },
        {
          text: "constructor",
          link: "/packages/aa-signers/lit-protocol/constructor",
        },
        {
          text: "authenticate",
          link: "/packages/aa-signers/lit-protocol/authenticate",
        },
        {
          text: "getAddress",
          link: "/packages/aa-signers/lit-protocol/getAddress",
        },
        {
          text: "signMessage",
          link: "/packages/aa-signers/lit-protocol/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-signers/lit-protocol/signTypedData",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-signers/lit-protocol/getAuthDetails",
        },
      ],
    },
    {
      text: "Passport Signer",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-signers/passport/introduction",
        },
        {
          text: "constructor",
          link: "/packages/aa-signers/passport/constructor",
        },
        {
          text: "authenticate",
          link: "/packages/aa-signers/passport/authenticate",
        },
        {
          text: "getAddress",
          link: "/packages/aa-signers/passport/getAddress",
        },
        {
          text: "signMessage",
          link: "/packages/aa-signers/passport/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-signers/passport/signTypedData",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-signers/passport/getAuthDetails",
        },
      ],
    },
    {
      text: "Fordefi Signer",
      collapsed: true,
      items: [
        {
          text: "Introduction",
          link: "/packages/aa-signers/fordefi/introduction",
        },
        {
          text: "constructor",
          link: "/packages/aa-signers/fordefi/constructor",
        },
        {
          text: "authenticate",
          link: "/packages/aa-signers/fordefi/authenticate",
        },
        { text: "getAddress", link: "/packages/aa-signers/fordefi/getAddress" },
        {
          text: "signMessage",
          link: "/packages/aa-signers/fordefi/signMessage",
        },
        {
          text: "signTypedData",
          link: "/packages/aa-signers/fordefi/signTypedData",
        },
        {
          text: "getAuthDetails",
          link: "/packages/aa-signers/fordefi/getAuthDetails",
        },
      ],
    },
    { text: "Contributing", link: "/packages/aa-signers/contributing" },
  ],
};

// vocs.config.tsx
import {
  Fragment,
  jsx,
  jsxs,
} from "file:///home/runner/work/aa-sdk/aa-sdk/node_modules/react/jsx-runtime.js";
var pkg = require_lerna();
var vocs_config_default = defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  logoUrl: {
    light: "/account-kit-light-mode.svg",
    dark: "/account-kit-dark-mode.svg",
  },
  iconUrl: "kit-icon.svg",
  rootDir: "./",
  head: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("script", {
        src: "https://static.alchemyapi.io/scripts/anayltics/alchemy-analytics.js",
        defer: true,
      }),
      /* @__PURE__ */ jsx("link", { rel: "icon", href: "/favicon.ico" }),
      /* @__PURE__ */ jsx("meta", {
        name: "google-site-verification",
        content: "W4pmFb0Oe26_OndBLdy5uqNrsl_gfmKfTlHwlHPd4Co",
      }),
      /* @__PURE__ */ jsx("meta", {
        property: "og:title",
        content: "Account Kit",
      }),
      /* @__PURE__ */ jsx("meta", {
        property: "og:description",
        content:
          "Account Kit is a framework to embed smart accounts in your web3 app, unlocking powerful features like email/social login, gas sponsorship, batched transactions, and more.",
      }),
      /* @__PURE__ */ jsx("meta", {
        property: "og:image",
        content: "/images/og-image.jpg",
      }),
      /* @__PURE__ */ jsx("meta", {
        property: "og:image:type",
        content: "image/jpeg",
      }),
      /* @__PURE__ */ jsx("meta", {
        property: "og:image:width",
        content: "2400",
      }),
      /* @__PURE__ */ jsx("meta", {
        property: "og:image:height",
        content: "1260",
      }),
      /* @__PURE__ */ jsx("meta", {
        name: "twitter:card",
        content: "summary_large_image",
      }),
      /* @__PURE__ */ jsx("meta", {
        name: "twitter:title",
        content: "Account Kit",
      }),
      /* @__PURE__ */ jsx("meta", {
        name: "twitter:description",
        content:
          "Account Kit is a framework to embed smart accounts in your web3 app, unlocking powerful features like email/social login, gas sponsorship, batched transactions, and more.",
      }),
      /* @__PURE__ */ jsx("meta", {
        name: "twitter:image",
        content: "/images/og-image.jpg",
      }),
    ],
  }),
  topNav: [
    { text: "Docs", link: "/getting-started/introduction" },
    {
      text: "Examples",
      link: "https://github.com/alchemyplatform/aa-sdk/tree/main/examples",
    },
    {
      text: pkg.version,
      items: [
        {
          text: "Migrating to 3.x.x",
          link: "/migration-guides/migrating-to-v3",
        },
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
  sidebar: [
    {
      text: "Getting started",
      items: [
        {
          text: "Overview",
          link: "/getting-started/overview",
        },
        {
          text: "Quick start",
          items: [
            { text: "Introduction", link: "/getting-started/introduction" },
            {
              text: "Setup",
              link: "/getting-started/setup-app",
            },
            {
              text: "Log in users",
              link: "/getting-started/log-in-users",
            },
            { text: "Send user operations", link: "/getting-started/send-uos" },
          ],
        },
      ],
    },
    {
      text: "Using Alchemy Signer",
      items: [
        {
          text: "Introduction",
          link: "/signers/alchemy-signer/introduction",
        },
        {
          text: "Passkey signup",
          link: "/signers/alchemy-signer/passkey-signup",
        },
        {
          text: "Passkey authentication",
          link: "/signers/alchemy-signer/passkey-auth",
        },
        {
          text: "User sessions",
          link: "/signers/alchemy-signer/manage-user-sessions",
        },
        {
          text: "Export private key",
          link: "/signers/alchemy-signer/export-private-key",
        },
      ],
    },
    {
      text: "Using smart accounts",
      items: [
        {
          text: "Send user operations",
          link: "/using-smart-accounts/send-user-operations",
        },
        {
          text: "Batch user operations",
          link: "/using-smart-accounts/batch-user-operations",
        },
        {
          text: "Sponsor gas",
          collapsed: false,
          items: [
            {
              text: "Use the Gas Manager",
              link: "/using-smart-accounts/sponsoring-gas/gas-manager",
            },
            {
              text: "Check eligibility",
              link: "/using-smart-accounts/sponsoring-gas/checking-eligibility",
            },
          ],
        },
        {
          text: "Simulate user operations",
          link: "/using-smart-accounts/simulate-user-operations",
        },
        {
          text: "Session keys",
          collapsed: false,
          items: [
            {
              text: "Overview",
              link: "/using-smart-accounts/session-keys/",
            },
            {
              text: "Getting started",
              link: "/using-smart-accounts/session-keys/getting-started",
            },
            {
              text: "Supported permissions",
              link: "/using-smart-accounts/session-keys/supported-permissions",
            },
          ],
        },
        {
          text: "Transfer ownership",
          collapsed: false,
          items: [
            {
              text: "Modular Account",
              link: "/using-smart-accounts/transfer-ownership/modular-account",
            },
            {
              text: "Light Account",
              link: "/using-smart-accounts/transfer-ownership/light-account",
            },
            {
              text: "Multi-Owner Light Account",
              link: "/using-smart-accounts/transfer-ownership/multi-owner-light-account",
            },
          ],
        },
        {
          text: "Alchemy enhanced APIs",
          collapsed: false,
          items: [
            {
              text: "Get account NFTs",
              link: "/using-smart-accounts/enhanced-apis/nft",
            },
            {
              text: "Get account tokens",
              link: "/using-smart-accounts/enhanced-apis/token",
            },
          ],
        },
      ],
    },
    {
      text: "React Hooks",
      items: [
        { text: "Overview", link: "/react/overview" },
        { text: "SSR", link: "/react/ssr" },
        { text: "createConfig", link: "/react/createConfig" },
        { text: "useAuthenticate", link: "/react/useAuthenticate" },
        { text: "useSmartAccountClient", link: "/react/useSmartAccountClient" },
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
    {
      text: "Choosing a smart account",
      items: [
        { text: "Introduction", link: "/smart-accounts/" },
        {
          text: "Modular Account",
          collapsed: false,
          items: [
            { text: "Introduction", link: "/smart-accounts/modular-account/" },
            {
              text: "Getting started",
              link: "/smart-accounts/modular-account/getting-started",
            },
            {
              text: "Deployments",
              link: "/smart-accounts/modular-account/deployments",
            },
            {
              text: "Upgrading to Modular Account",
              link: "/smart-accounts/modular-account/upgrade-la-to-ma",
            },
            {
              text: "Multisig Plugin",
              collapsed: true,
              items: [
                {
                  text: "Introduction",
                  link: "/smart-accounts/modular-account/multisig-plugin/",
                },
                {
                  text: "Getting started",
                  link: "/smart-accounts/modular-account/multisig-plugin/getting-started",
                },
                {
                  text: "Technical details",
                  link: "/smart-accounts/modular-account/multisig-plugin/technical-details",
                },
              ],
            },
          ],
        },
        {
          text: "Light Account",
          collapsed: false,
          items: [
            { text: "Overview", link: "/smart-accounts/light-account/" },
            {
              text: "Getting started",
              link: "/smart-accounts/light-account/getting-started",
            },
            {
              text: "Deployments",
              link: "/smart-accounts/light-account/deployments",
            },
          ],
        },
        {
          text: "Custom accounts",
          collapsed: true,
          items: [
            {
              text: "Use your own",
              link: "/smart-accounts/custom/using-your-own",
            },
            {
              text: "Contribute your account",
              link: "/smart-accounts/custom/contributing",
            },
          ],
        },
        { text: "Gas benchmarks", link: "/smart-accounts/gas-benchmarks" },
      ],
    },
    {
      text: "Extending smart accounts",
      items: [
        {
          text: "Install plugins",
          link: "/extending-smart-accounts/install-plugins",
        },
        {
          text: "Get installed plugins",
          link: "/extending-smart-accounts/get-installed-plugins",
        },
      ],
    },
    {
      text: "Custom signers",
      items: [
        { text: "Introduction", link: "/signers/choosing-a-signer" },
        {
          text: "Third-party signers",
          collapsed: true,
          items: [
            { text: "Magic", link: "/signers/guides/magic" },
            { text: "Web3Auth", link: "/signers/guides/web3auth" },
            { text: "Turnkey", link: "/signers/guides/turnkey" },
            { text: "Privy", link: "/signers/guides/privy" },
            { text: "Dynamic", link: "/signers/guides/dynamic" },
            { text: "Fireblocks", link: "/signers/guides/fireblocks" },
            { text: "Portal", link: "/signers/guides/portal" },
            { text: "Capsule", link: "/signers/guides/capsule" },
            { text: "Lit Protocol", link: "/signers/guides/lit" },
            {
              text: "Particle Network",
              link: "/signers/guides/particle-network",
            },
            { text: "Arcana Auth", link: "/signers/guides/arcana-auth" },
            { text: "Dfns", link: "/signers/guides/dfns" },
            { text: "WalletKit", link: "/signers/guides/walletkit" },
            { text: "Passport", link: "/signers/guides/passport" },
          ],
        },
        { text: "EOA signer", link: "/signers/eoa" },
        {
          text: "Build your own",
          link: "/signers/guides/custom-signer",
        },
        {
          text: "Contribute your signer",
          link: "/signers/contributing",
        },
      ],
    },
    {
      text: "Custom infra",
      items: [
        { text: "Use custom bundler", link: "/third-party/bundlers" },
        { text: "Use custom paymaster", link: "/third-party/paymasters" },
      ],
    },
    {
      text: "aa-sdk packages",
      items: [
        { text: "Overview", link: "/packages/" },
        aaCoreSideBar,
        aaAlchemySidebar,
        aaAccountsSidebar,
        aaSignersSidebar,
        aaEthersSidebar,
      ],
    },
    {
      text: "Resources",
      items: [
        { text: "FAQs", link: "/resources/faqs" },
        { text: "React Native", link: "/resources/react-native" },
        { text: "Terms", link: "/resources/terms" },
        { text: "Types", link: "/resources/types" },
        { text: "Contact us", link: "/resources/contact-us" },
      ],
    },
  ],
  socials: [
    { icon: "github", link: "https://github.com/alchemyplatform/aa-sdk" },
  ],
  theme: {
    accentColor: "#ce26a2",
  },
  // This is not supported in vocs
  // sitemap: {
  //   hostname: "https://accountkit.alchemy.com",
  // },
});
export { vocs_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbGVybmEuanNvbiIsICJ2b2NzLmNvbmZpZy50c3giLCAic2lkZWJhci9hYS1hY2NvdW50cy50cyIsICJzaWRlYmFyL2FhLWFsY2hlbXkudHMiLCAic2lkZWJhci9hYS1jb3JlLnRzIiwgInNpZGViYXIvYWEtZXRoZXJzLnRzIiwgInNpZGViYXIvYWEtc2lnbmVycy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsie1xuICBcIiRzY2hlbWFcIjogXCJub2RlX21vZHVsZXMvbGVybmEvc2NoZW1hcy9sZXJuYS1zY2hlbWEuanNvblwiLFxuICBcInZlcnNpb25cIjogXCIzLjE3LjBcIixcbiAgXCJucG1DbGllbnRcIjogXCJ5YXJuXCIsXG4gIFwiY29udmVudGlvbmFsQ29tbWl0c1wiOiB0cnVlLFxuICBcImNoYW5nZWxvZ1wiOiB0cnVlLFxuICBcImNvbW1hbmRcIjoge1xuICAgIFwidmVyc2lvblwiOiB7XG4gICAgICBcIm1lc3NhZ2VcIjogXCJjaG9yZShyZWxlYXNlKTogcHVibGlzaCAlcyBbc2tpcC1jaV1cIlxuICAgIH1cbiAgfSxcbiAgXCJncmFudWxhclBhdGhzcGVjXCI6IGZhbHNlXG59XG4iLCAiaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZvY3NcIjtcbmltcG9ydCB7IGFhQWNjb3VudHNTaWRlYmFyIH0gZnJvbSBcIi4vc2lkZWJhci9hYS1hY2NvdW50cy5qc1wiO1xuaW1wb3J0IHsgYWFBbGNoZW15U2lkZWJhciB9IGZyb20gXCIuL3NpZGViYXIvYWEtYWxjaGVteS5qc1wiO1xuaW1wb3J0IHsgYWFDb3JlU2lkZUJhciB9IGZyb20gXCIuL3NpZGViYXIvYWEtY29yZS5qc1wiO1xuaW1wb3J0IHsgYWFFdGhlcnNTaWRlYmFyIH0gZnJvbSBcIi4vc2lkZWJhci9hYS1ldGhlcnMuanNcIjtcbmltcG9ydCB7IGFhU2lnbmVyc1NpZGViYXIgfSBmcm9tIFwiLi9zaWRlYmFyL2FhLXNpZ25lcnMuanNcIjtcblxuY29uc3QgcGtnID0gcmVxdWlyZShcIi4uL2xlcm5hLmpzb25cIik7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHRpdGxlOiBcIkFjY291bnQgS2l0XCIsXG4gIGRlc2NyaXB0aW9uOiBcIkFjY291bnQgQWJzdHJhY3Rpb24gTGVnb3NcIixcbiAgbG9nb1VybDoge1xuICAgIGxpZ2h0OiBcIi9hY2NvdW50LWtpdC1saWdodC1tb2RlLnN2Z1wiLFxuICAgIGRhcms6IFwiL2FjY291bnQta2l0LWRhcmstbW9kZS5zdmdcIixcbiAgfSxcbiAgaWNvblVybDogXCJraXQtaWNvbi5zdmdcIixcbiAgcm9vdERpcjogXCIuL1wiLFxuICBoZWFkOiAoXG4gICAgPD5cbiAgICAgIDxzY3JpcHRcbiAgICAgICAgc3JjPVwiaHR0cHM6Ly9zdGF0aWMuYWxjaGVteWFwaS5pby9zY3JpcHRzL2FuYXlsdGljcy9hbGNoZW15LWFuYWx5dGljcy5qc1wiXG4gICAgICAgIGRlZmVyXG4gICAgICAvPlxuICAgICAgPGxpbmsgcmVsPVwiaWNvblwiIGhyZWY9XCIvZmF2aWNvbi5pY29cIiAvPlxuICAgICAgPG1ldGFcbiAgICAgICAgbmFtZT1cImdvb2dsZS1zaXRlLXZlcmlmaWNhdGlvblwiXG4gICAgICAgIGNvbnRlbnQ9XCJXNHBtRmIwT2UyNl9PbmRCTGR5NXVxTnJzbF9nZm1LZlRsSHdsSFBkNENvXCJcbiAgICAgIC8+XG4gICAgICB7LyogT3BlbiBHcmFwaCBUYWdzICovfVxuICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZzp0aXRsZVwiIGNvbnRlbnQ9XCJBY2NvdW50IEtpdFwiPjwvbWV0YT5cbiAgICAgIDxtZXRhXG4gICAgICAgIHByb3BlcnR5PVwib2c6ZGVzY3JpcHRpb25cIlxuICAgICAgICBjb250ZW50PVwiQWNjb3VudCBLaXQgaXMgYSBmcmFtZXdvcmsgdG8gZW1iZWQgc21hcnQgYWNjb3VudHMgaW4geW91ciB3ZWIzIGFwcCwgdW5sb2NraW5nIHBvd2VyZnVsIGZlYXR1cmVzIGxpa2UgZW1haWwvc29jaWFsIGxvZ2luLCBnYXMgc3BvbnNvcnNoaXAsIGJhdGNoZWQgdHJhbnNhY3Rpb25zLCBhbmQgbW9yZS5cIlxuICAgICAgPjwvbWV0YT5cbiAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6aW1hZ2VcIiBjb250ZW50PVwiL2ltYWdlcy9vZy1pbWFnZS5qcGdcIj48L21ldGE+XG4gICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOmltYWdlOnR5cGVcIiBjb250ZW50PVwiaW1hZ2UvanBlZ1wiPjwvbWV0YT5cbiAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6aW1hZ2U6d2lkdGhcIiBjb250ZW50PVwiMjQwMFwiPjwvbWV0YT5cbiAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6aW1hZ2U6aGVpZ2h0XCIgY29udGVudD1cIjEyNjBcIj48L21ldGE+XG4gICAgICB7LyogVHdpdHRlciBDYXJkIFRhZ3MgKi99XG4gICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpjYXJkXCIgY29udGVudD1cInN1bW1hcnlfbGFyZ2VfaW1hZ2VcIj48L21ldGE+XG4gICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjp0aXRsZVwiIGNvbnRlbnQ9XCJBY2NvdW50IEtpdFwiPjwvbWV0YT5cbiAgICAgIDxtZXRhXG4gICAgICAgIG5hbWU9XCJ0d2l0dGVyOmRlc2NyaXB0aW9uXCJcbiAgICAgICAgY29udGVudD1cIkFjY291bnQgS2l0IGlzIGEgZnJhbWV3b3JrIHRvIGVtYmVkIHNtYXJ0IGFjY291bnRzIGluIHlvdXIgd2ViMyBhcHAsIHVubG9ja2luZyBwb3dlcmZ1bCBmZWF0dXJlcyBsaWtlIGVtYWlsL3NvY2lhbCBsb2dpbiwgZ2FzIHNwb25zb3JzaGlwLCBiYXRjaGVkIHRyYW5zYWN0aW9ucywgYW5kIG1vcmUuXCJcbiAgICAgID48L21ldGE+XG4gICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjppbWFnZVwiIGNvbnRlbnQ9XCIvaW1hZ2VzL29nLWltYWdlLmpwZ1wiPjwvbWV0YT5cbiAgICA8Lz5cbiAgKSxcbiAgdG9wTmF2OiBbXG4gICAgeyB0ZXh0OiBcIkRvY3NcIiwgbGluazogXCIvZ2V0dGluZy1zdGFydGVkL2ludHJvZHVjdGlvblwiIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJFeGFtcGxlc1wiLFxuICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYWxjaGVteXBsYXRmb3JtL2FhLXNkay90cmVlL21haW4vZXhhbXBsZXNcIixcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IHBrZy52ZXJzaW9uLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiTWlncmF0aW5nIHRvIDMueC54XCIsXG4gICAgICAgICAgbGluazogXCIvbWlncmF0aW9uLWd1aWRlcy9taWdyYXRpbmctdG8tdjNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQ2hhbmdlbG9nXCIsXG4gICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYWxjaGVteXBsYXRmb3JtL2FhLXNkay9ibG9iL21haW4vQ0hBTkdFTE9HLm1kXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkNvbnRyaWJ1dGluZ1wiLFxuICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2FsY2hlbXlwbGF0Zm9ybS9hYS1zZGsvYmxvYi9tYWluL0NPTlRSSUJVVElORy5tZFwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICBdLFxuICBzaWRlYmFyOiBbXG4gICAge1xuICAgICAgdGV4dDogXCJHZXR0aW5nIHN0YXJ0ZWRcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk92ZXJ2aWV3XCIsXG4gICAgICAgICAgbGluazogXCIvZ2V0dGluZy1zdGFydGVkL292ZXJ2aWV3XCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlF1aWNrIHN0YXJ0XCIsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHsgdGV4dDogXCJJbnRyb2R1Y3Rpb25cIiwgbGluazogXCIvZ2V0dGluZy1zdGFydGVkL2ludHJvZHVjdGlvblwiIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiU2V0dXBcIixcbiAgICAgICAgICAgICAgbGluazogXCIvZ2V0dGluZy1zdGFydGVkL3NldHVwLWFwcFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJMb2cgaW4gdXNlcnNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvZ2V0dGluZy1zdGFydGVkL2xvZy1pbi11c2Vyc1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJTZW5kIHVzZXIgb3BlcmF0aW9uc1wiLCBsaW5rOiBcIi9nZXR0aW5nLXN0YXJ0ZWQvc2VuZC11b3NcIiB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJVc2luZyBBbGNoZW15IFNpZ25lclwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvc2lnbmVycy9hbGNoZW15LXNpZ25lci9pbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiUGFzc2tleSBzaWdudXBcIixcbiAgICAgICAgICBsaW5rOiBcIi9zaWduZXJzL2FsY2hlbXktc2lnbmVyL3Bhc3NrZXktc2lnbnVwXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlBhc3NrZXkgYXV0aGVudGljYXRpb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9zaWduZXJzL2FsY2hlbXktc2lnbmVyL3Bhc3NrZXktYXV0aFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJVc2VyIHNlc3Npb25zXCIsXG4gICAgICAgICAgbGluazogXCIvc2lnbmVycy9hbGNoZW15LXNpZ25lci9tYW5hZ2UtdXNlci1zZXNzaW9uc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJFeHBvcnQgcHJpdmF0ZSBrZXlcIixcbiAgICAgICAgICBsaW5rOiBcIi9zaWduZXJzL2FsY2hlbXktc2lnbmVyL2V4cG9ydC1wcml2YXRlLWtleVwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiVXNpbmcgc21hcnQgYWNjb3VudHNcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlNlbmQgdXNlciBvcGVyYXRpb25zXCIsXG4gICAgICAgICAgbGluazogXCIvdXNpbmctc21hcnQtYWNjb3VudHMvc2VuZC11c2VyLW9wZXJhdGlvbnNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQmF0Y2ggdXNlciBvcGVyYXRpb25zXCIsXG4gICAgICAgICAgbGluazogXCIvdXNpbmctc21hcnQtYWNjb3VudHMvYmF0Y2gtdXNlci1vcGVyYXRpb25zXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlNwb25zb3IgZ2FzXCIsXG4gICAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlVzZSB0aGUgR2FzIE1hbmFnZXJcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNpbmctc21hcnQtYWNjb3VudHMvc3BvbnNvcmluZy1nYXMvZ2FzLW1hbmFnZXJcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiQ2hlY2sgZWxpZ2liaWxpdHlcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNpbmctc21hcnQtYWNjb3VudHMvc3BvbnNvcmluZy1nYXMvY2hlY2tpbmctZWxpZ2liaWxpdHlcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU2ltdWxhdGUgdXNlciBvcGVyYXRpb25zXCIsXG4gICAgICAgICAgbGluazogXCIvdXNpbmctc21hcnQtYWNjb3VudHMvc2ltdWxhdGUtdXNlci1vcGVyYXRpb25zXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlNlc3Npb24ga2V5c1wiLFxuICAgICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJPdmVydmlld1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2luZy1zbWFydC1hY2NvdW50cy9zZXNzaW9uLWtleXMvXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkdldHRpbmcgc3RhcnRlZFwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2luZy1zbWFydC1hY2NvdW50cy9zZXNzaW9uLWtleXMvZ2V0dGluZy1zdGFydGVkXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlN1cHBvcnRlZCBwZXJtaXNzaW9uc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2luZy1zbWFydC1hY2NvdW50cy9zZXNzaW9uLWtleXMvc3VwcG9ydGVkLXBlcm1pc3Npb25zXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlRyYW5zZmVyIG93bmVyc2hpcFwiLFxuICAgICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJNb2R1bGFyIEFjY291bnRcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNpbmctc21hcnQtYWNjb3VudHMvdHJhbnNmZXItb3duZXJzaGlwL21vZHVsYXItYWNjb3VudFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJMaWdodCBBY2NvdW50XCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzaW5nLXNtYXJ0LWFjY291bnRzL3RyYW5zZmVyLW93bmVyc2hpcC9saWdodC1hY2NvdW50XCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIk11bHRpLU93bmVyIExpZ2h0IEFjY291bnRcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNpbmctc21hcnQtYWNjb3VudHMvdHJhbnNmZXItb3duZXJzaGlwL211bHRpLW93bmVyLWxpZ2h0LWFjY291bnRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQWxjaGVteSBlbmhhbmNlZCBBUElzXCIsXG4gICAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkdldCBhY2NvdW50IE5GVHNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNpbmctc21hcnQtYWNjb3VudHMvZW5oYW5jZWQtYXBpcy9uZnRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiR2V0IGFjY291bnQgdG9rZW5zXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzaW5nLXNtYXJ0LWFjY291bnRzL2VuaGFuY2VkLWFwaXMvdG9rZW5cIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIlJlYWN0IEhvb2tzXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IHRleHQ6IFwiT3ZlcnZpZXdcIiwgbGluazogXCIvcmVhY3Qvb3ZlcnZpZXdcIiB9LFxuICAgICAgICB7IHRleHQ6IFwiU1NSXCIsIGxpbms6IFwiL3JlYWN0L3NzclwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJjcmVhdGVDb25maWdcIiwgbGluazogXCIvcmVhY3QvY3JlYXRlQ29uZmlnXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcInVzZUF1dGhlbnRpY2F0ZVwiLCBsaW5rOiBcIi9yZWFjdC91c2VBdXRoZW50aWNhdGVcIiB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlU21hcnRBY2NvdW50Q2xpZW50XCIsIGxpbms6IFwiL3JlYWN0L3VzZVNtYXJ0QWNjb3VudENsaWVudFwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJ1c2VDbGllbnRBY3Rpb25zXCIsIGxpbms6IFwiL3JlYWN0L3VzZUNsaWVudEFjdGlvbnNcIiB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlQWNjb3VudFwiLCBsaW5rOiBcIi9yZWFjdC91c2VBY2NvdW50XCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcInVzZVNpZ25lclwiLCBsaW5rOiBcIi9yZWFjdC91c2VTaWduZXJcIiB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlU2lnbmVyU3RhdHVzXCIsIGxpbms6IFwiL3JlYWN0L3VzZVNpZ25lclN0YXR1c1wiIH0sXG4gICAgICAgIHsgdGV4dDogXCJ1c2VVc2VyXCIsIGxpbms6IFwiL3JlYWN0L3VzZVVzZXJcIiB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlQnVuZGxlckNsaWVudFwiLCBsaW5rOiBcIi9yZWFjdC91c2VCdW5kbGVyQ2xpZW50XCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcInVzZUFkZFBhc3NrZXlcIiwgbGluazogXCIvcmVhY3QvdXNlQWRkUGFzc2tleVwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJ1c2VMb2dvdXRcIiwgbGluazogXCIvcmVhY3QvdXNlTG9nb3V0XCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcInVzZUV4cG9ydEFjY291bnRcIiwgbGluazogXCIvcmVhY3QvdXNlRXhwb3J0QWNjb3VudFwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJ1c2VTaWduTWVzc2FnZVwiLCBsaW5rOiBcIi9yZWFjdC91c2VTaWduTWVzc2FnZVwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJ1c2VTaWduVHlwZWREYXRhXCIsIGxpbms6IFwiL3JlYWN0L3VzZVNpZ25UeXBlZERhdGFcIiB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlU2VuZFVzZXJPcGVyYXRpb25cIiwgbGluazogXCIvcmVhY3QvdXNlU2VuZFVzZXJPcGVyYXRpb25cIiB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJ1c2VEcm9wQW5kUmVwbGFjZVVzZXJPcGVyYXRpb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9yZWFjdC91c2VEcm9wQW5kUmVwbGFjZVVzZXJPcGVyYXRpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwidXNlV2FpdEZvclVzZXJPcGVyYXRpb25UcmFuc2FjdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3JlYWN0L3VzZVdhaXRGb3JVc2VyT3BlcmF0aW9uVHJhbnNhY3Rpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgeyB0ZXh0OiBcInVzZVNlbmRUcmFuc2FjdGlvblwiLCBsaW5rOiBcIi9yZWFjdC91c2VTZW5kVHJhbnNhY3Rpb25cIiB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlU2VuZFRyYW5zYWN0aW9uc1wiLCBsaW5rOiBcIi9yZWFjdC91c2VTZW5kVHJhbnNhY3Rpb25zXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcInVzZUNoYWluXCIsIGxpbms6IFwiL3JlYWN0L3VzZUNoYWluXCIgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkNob29zaW5nIGEgc21hcnQgYWNjb3VudFwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkludHJvZHVjdGlvblwiLCBsaW5rOiBcIi9zbWFydC1hY2NvdW50cy9cIiB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJNb2R1bGFyIEFjY291bnRcIixcbiAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7IHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsIGxpbms6IFwiL3NtYXJ0LWFjY291bnRzL21vZHVsYXItYWNjb3VudC9cIiB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkdldHRpbmcgc3RhcnRlZFwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9zbWFydC1hY2NvdW50cy9tb2R1bGFyLWFjY291bnQvZ2V0dGluZy1zdGFydGVkXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkRlcGxveW1lbnRzXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3NtYXJ0LWFjY291bnRzL21vZHVsYXItYWNjb3VudC9kZXBsb3ltZW50c1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJVcGdyYWRpbmcgdG8gTW9kdWxhciBBY2NvdW50XCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3NtYXJ0LWFjY291bnRzL21vZHVsYXItYWNjb3VudC91cGdyYWRlLWxhLXRvLW1hXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIk11bHRpc2lnIFBsdWdpblwiLFxuICAgICAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJJbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL3NtYXJ0LWFjY291bnRzL21vZHVsYXItYWNjb3VudC9tdWx0aXNpZy1wbHVnaW4vXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcIkdldHRpbmcgc3RhcnRlZFwiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvc21hcnQtYWNjb3VudHMvbW9kdWxhci1hY2NvdW50L211bHRpc2lnLXBsdWdpbi9nZXR0aW5nLXN0YXJ0ZWRcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiVGVjaG5pY2FsIGRldGFpbHNcIixcbiAgICAgICAgICAgICAgICAgIGxpbms6IFwiL3NtYXJ0LWFjY291bnRzL21vZHVsYXItYWNjb3VudC9tdWx0aXNpZy1wbHVnaW4vdGVjaG5pY2FsLWRldGFpbHNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJMaWdodCBBY2NvdW50XCIsXG4gICAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgeyB0ZXh0OiBcIk92ZXJ2aWV3XCIsIGxpbms6IFwiL3NtYXJ0LWFjY291bnRzL2xpZ2h0LWFjY291bnQvXCIgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJHZXR0aW5nIHN0YXJ0ZWRcIixcbiAgICAgICAgICAgICAgbGluazogXCIvc21hcnQtYWNjb3VudHMvbGlnaHQtYWNjb3VudC9nZXR0aW5nLXN0YXJ0ZWRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiRGVwbG95bWVudHNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvc21hcnQtYWNjb3VudHMvbGlnaHQtYWNjb3VudC9kZXBsb3ltZW50c1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJDdXN0b20gYWNjb3VudHNcIixcbiAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJVc2UgeW91ciBvd25cIixcbiAgICAgICAgICAgICAgbGluazogXCIvc21hcnQtYWNjb3VudHMvY3VzdG9tL3VzaW5nLXlvdXItb3duXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkNvbnRyaWJ1dGUgeW91ciBhY2NvdW50XCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3NtYXJ0LWFjY291bnRzL2N1c3RvbS9jb250cmlidXRpbmdcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgeyB0ZXh0OiBcIkdhcyBiZW5jaG1hcmtzXCIsIGxpbms6IFwiL3NtYXJ0LWFjY291bnRzL2dhcy1iZW5jaG1hcmtzXCIgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkV4dGVuZGluZyBzbWFydCBhY2NvdW50c1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiSW5zdGFsbCBwbHVnaW5zXCIsXG4gICAgICAgICAgbGluazogXCIvZXh0ZW5kaW5nLXNtYXJ0LWFjY291bnRzL2luc3RhbGwtcGx1Z2luc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHZXQgaW5zdGFsbGVkIHBsdWdpbnNcIixcbiAgICAgICAgICBsaW5rOiBcIi9leHRlbmRpbmctc21hcnQtYWNjb3VudHMvZ2V0LWluc3RhbGxlZC1wbHVnaW5zXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJDdXN0b20gc2lnbmVyc1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkludHJvZHVjdGlvblwiLCBsaW5rOiBcIi9zaWduZXJzL2Nob29zaW5nLWEtc2lnbmVyXCIgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiVGhpcmQtcGFydHkgc2lnbmVyc1wiLFxuICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgeyB0ZXh0OiBcIk1hZ2ljXCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL21hZ2ljXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJXZWIzQXV0aFwiLCBsaW5rOiBcIi9zaWduZXJzL2d1aWRlcy93ZWIzYXV0aFwiIH0sXG4gICAgICAgICAgICB7IHRleHQ6IFwiVHVybmtleVwiLCBsaW5rOiBcIi9zaWduZXJzL2d1aWRlcy90dXJua2V5XCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJQcml2eVwiLCBsaW5rOiBcIi9zaWduZXJzL2d1aWRlcy9wcml2eVwiIH0sXG4gICAgICAgICAgICB7IHRleHQ6IFwiRHluYW1pY1wiLCBsaW5rOiBcIi9zaWduZXJzL2d1aWRlcy9keW5hbWljXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJGaXJlYmxvY2tzXCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL2ZpcmVibG9ja3NcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIlBvcnRhbFwiLCBsaW5rOiBcIi9zaWduZXJzL2d1aWRlcy9wb3J0YWxcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIkNhcHN1bGVcIiwgbGluazogXCIvc2lnbmVycy9ndWlkZXMvY2Fwc3VsZVwiIH0sXG4gICAgICAgICAgICB7IHRleHQ6IFwiTGl0IFByb3RvY29sXCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL2xpdFwiIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiUGFydGljbGUgTmV0d29ya1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9zaWduZXJzL2d1aWRlcy9wYXJ0aWNsZS1uZXR3b3JrXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIkFyY2FuYSBBdXRoXCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL2FyY2FuYS1hdXRoXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJEZm5zXCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL2RmbnNcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIldhbGxldEtpdFwiLCBsaW5rOiBcIi9zaWduZXJzL2d1aWRlcy93YWxsZXRraXRcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIlBhc3Nwb3J0XCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL3Bhc3Nwb3J0XCIgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7IHRleHQ6IFwiRU9BIHNpZ25lclwiLCBsaW5rOiBcIi9zaWduZXJzL2VvYVwiIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkJ1aWxkIHlvdXIgb3duXCIsXG4gICAgICAgICAgbGluazogXCIvc2lnbmVycy9ndWlkZXMvY3VzdG9tLXNpZ25lclwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJDb250cmlidXRlIHlvdXIgc2lnbmVyXCIsXG4gICAgICAgICAgbGluazogXCIvc2lnbmVycy9jb250cmlidXRpbmdcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcblxuICAgIHtcbiAgICAgIHRleHQ6IFwiQ3VzdG9tIGluZnJhXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IHRleHQ6IFwiVXNlIGN1c3RvbSBidW5kbGVyXCIsIGxpbms6IFwiL3RoaXJkLXBhcnR5L2J1bmRsZXJzXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcIlVzZSBjdXN0b20gcGF5bWFzdGVyXCIsIGxpbms6IFwiL3RoaXJkLXBhcnR5L3BheW1hc3RlcnNcIiB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiYWEtc2RrIHBhY2thZ2VzXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IHRleHQ6IFwiT3ZlcnZpZXdcIiwgbGluazogXCIvcGFja2FnZXMvXCIgfSxcbiAgICAgICAgYWFDb3JlU2lkZUJhcixcbiAgICAgICAgYWFBbGNoZW15U2lkZWJhcixcbiAgICAgICAgYWFBY2NvdW50c1NpZGViYXIsXG4gICAgICAgIGFhU2lnbmVyc1NpZGViYXIsXG4gICAgICAgIGFhRXRoZXJzU2lkZWJhcixcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIlJlc291cmNlc1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkZBUXNcIiwgbGluazogXCIvcmVzb3VyY2VzL2ZhcXNcIiB9LFxuICAgICAgICB7IHRleHQ6IFwiUmVhY3QgTmF0aXZlXCIsIGxpbms6IFwiL3Jlc291cmNlcy9yZWFjdC1uYXRpdmVcIiB9LFxuICAgICAgICB7IHRleHQ6IFwiVGVybXNcIiwgbGluazogXCIvcmVzb3VyY2VzL3Rlcm1zXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcIlR5cGVzXCIsIGxpbms6IFwiL3Jlc291cmNlcy90eXBlc1wiIH0sXG4gICAgICAgIHsgdGV4dDogXCJDb250YWN0IHVzXCIsIGxpbms6IFwiL3Jlc291cmNlcy9jb250YWN0LXVzXCIgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXSxcbiAgc29jaWFsczogW1xuICAgIHsgaWNvbjogXCJnaXRodWJcIiwgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYWxjaGVteXBsYXRmb3JtL2FhLXNka1wiIH0sXG4gIF0sXG4gIHRoZW1lOiB7XG4gICAgYWNjZW50Q29sb3I6IFwiI2NlMjZhMlwiLFxuICB9LFxuICAvLyBUaGlzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdm9jc1xuICAvLyBzaXRlbWFwOiB7XG4gIC8vICAgaG9zdG5hbWU6IFwiaHR0cHM6Ly9hY2NvdW50a2l0LmFsY2hlbXkuY29tXCIsXG4gIC8vIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcnVubmVyL3dvcmsvYWEtc2RrL2FhLXNkay9zaXRlL3NpZGViYXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3J1bm5lci93b3JrL2FhLXNkay9hYS1zZGsvc2l0ZS9zaWRlYmFyL2FhLWFjY291bnRzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3J1bm5lci93b3JrL2FhLXNkay9hYS1zZGsvc2l0ZS9zaWRlYmFyL2FhLWFjY291bnRzLnRzXCI7aW1wb3J0IHsgU2lkZWJhckl0ZW0gfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgY29uc3QgYWFBY2NvdW50c1NpZGViYXI6IFNpZGViYXJJdGVtID0ge1xuICB0ZXh0OiBcImFhLWFjY291bnRzXCIsXG4gIGNvbGxhcHNlZDogdHJ1ZSxcbiAgaXRlbXM6IFtcbiAgICB7XG4gICAgICB0ZXh0OiBcIkdldHRpbmcgc3RhcnRlZFwiLFxuICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtYWNjb3VudHMvXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkxpZ2h0IEFjY291bnRcIixcbiAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWFjY291bnRzL2xpZ2h0LWFjY291bnQvXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkxpZ2h0IEFjY291bnQgQWN0aW9uc1wiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwidHJhbnNmZXJPd25lcnNoaXBcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1hY2NvdW50cy9saWdodC1hY2NvdW50L2FjdGlvbnMvdHJhbnNmZXJPd25lcnNoaXBcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkxpZ2h0IEFjY291bnQgQ2xpZW50XCIsXG4gICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1hY2NvdW50cy9saWdodC1hY2NvdW50L2NsaWVudFwiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJVdGlsc1wiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiZ2V0RGVmYXVsdExpZ2h0QWNjb3VudEZhY3RvcnlBZGRyZXNzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtYWNjb3VudHMvdXRpbHMvZ2V0RGVmYXVsdExpZ2h0QWNjb3VudEZhY3RvcnlBZGRyZXNzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAgeyB0ZXh0OiBcIkNvbnRyaWJ1dGluZ1wiLCBsaW5rOiBcIi9wYWNrYWdlcy9hYS1hY2NvdW50cy9jb250cmlidXRpbmdcIiB9LFxuICBdLFxufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcnVubmVyL3dvcmsvYWEtc2RrL2FhLXNkay9zaXRlL3NpZGViYXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3J1bm5lci93b3JrL2FhLXNkay9hYS1zZGsvc2l0ZS9zaWRlYmFyL2FhLWFsY2hlbXkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcnVubmVyL3dvcmsvYWEtc2RrL2FhLXNkay9zaXRlL3NpZGViYXIvYWEtYWxjaGVteS50c1wiO2ltcG9ydCB7IFNpZGViYXJJdGVtIH0gZnJvbSBcInZvY3NcIjtcblxuZXhwb3J0IGNvbnN0IGFhQWxjaGVteVNpZGViYXI6IFNpZGViYXJJdGVtID0ge1xuICB0ZXh0OiBcImFhLWFsY2hlbXlcIixcbiAgY29sbGFwc2VkOiB0cnVlLFxuICBpdGVtczogW1xuICAgIHtcbiAgICAgIHRleHQ6IFwiR2V0dGluZyBzdGFydGVkXCIsXG4gICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1hbGNoZW15L1wiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJTbWFydCBBY2NvdW50IENsaWVudFwiLFxuICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtYWxjaGVteS9zbWFydC1hY2NvdW50LWNsaWVudC9cIixcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiU21hcnQgQWNjb3VudCBBY3Rpb25zXCIsXG4gICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJzaW11bGF0ZVVzZXJPcGVyYXRpb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1hbGNoZW15L3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvc2ltdWxhdGVVc2VyT3BlcmF0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImFsY2hlbXlFbmhhbmNlZEFwaUFjdGlvbnNcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1hbGNoZW15L3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvYWxjaGVteUVuaGFuY2VkQXBpQWN0aW9uc1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiTGlnaHQgQWNjb3VudCBDbGllbnRcIixcbiAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWFsY2hlbXkvbGlnaHQtYWNjb3VudC1jbGllbnQvXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIk11bHRpc2lnIEFjY291bnQgQ2xpZW50XCIsXG4gICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1hbGNoZW15L21vZHVsYXItYWNjb3VudC1jbGllbnQvbXVsdGlzaWctYWNjb3VudC1jbGllbnRcIixcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiTWlkZGxld2FyZVwiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiYWxjaGVteUZlZUVzdGltYXRvclwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWFsY2hlbXkvbWlkZGxld2FyZS9hbGNoZW15RmVlRXN0aW1hdG9yXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImFsY2hlbXlHYXNNYW5hZ2VyTWlkZGxld2FyZVwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWFsY2hlbXkvbWlkZGxld2FyZS9hbGNoZW15R2FzTWFuYWdlck1pZGRsZXdhcmVcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiYWxjaGVteVVzZXJPcGVyYXRpb25TaW11bGF0b3JcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1hbGNoZW15L21pZGRsZXdhcmUvYWxjaGVteVVzZXJPcGVyYXRpb25TaW11bGF0b3JcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkFsY2hlbXkgU2lnbmVyXCIsXG4gICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJPdmVydmlld1wiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWFsY2hlbXkvc2lnbmVyL292ZXJ2aWV3XCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImF1dGhlbnRpY2F0ZVwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWFsY2hlbXkvc2lnbmVyL2F1dGhlbnRpY2F0ZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJkaXNjb25uZWN0XCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtYWxjaGVteS9zaWduZXIvZGlzY29ubmVjdFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRBdXRoRGV0YWlsc1wiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWFsY2hlbXkvc2lnbmVyL2dldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgIH0sXG5cbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiZ2V0QWRkcmVzc1wiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWFsY2hlbXkvc2lnbmVyL2dldEFkZHJlc3NcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwic2lnbk1lc3NhZ2VcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1hbGNoZW15L3NpZ25lci9zaWduTWVzc2FnZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJzaWduVHlwZWREYXRhXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtYWxjaGVteS9zaWduZXIvc2lnblR5cGVkRGF0YVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRVc2VyXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtYWxjaGVteS9zaWduZXIvZ2V0VXNlclwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJhZGRQYXNza2V5XCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtYWxjaGVteS9zaWduZXIvYWRkUGFzc2tleVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJleHBvcnRXYWxsZXRcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1hbGNoZW15L3NpZ25lci9leHBvcnRXYWxsZXRcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIlV0aWxzXCIsXG4gICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJkZWZpbmVBbGNoZW15Q2hhaW5cIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1hbGNoZW15L3V0aWxzL2RlZmluZUFsY2hlbXlDaGFpblwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICBdLFxufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcnVubmVyL3dvcmsvYWEtc2RrL2FhLXNkay9zaXRlL3NpZGViYXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3J1bm5lci93b3JrL2FhLXNkay9hYS1zZGsvc2l0ZS9zaWRlYmFyL2FhLWNvcmUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcnVubmVyL3dvcmsvYWEtc2RrL2FhLXNkay9zaXRlL3NpZGViYXIvYWEtY29yZS50c1wiO2ltcG9ydCB7IFNpZGViYXJJdGVtIH0gZnJvbSBcInZvY3NcIjtcblxuZXhwb3J0IGNvbnN0IGFhQ29yZVNpZGVCYXI6IFNpZGViYXJJdGVtID0ge1xuICB0ZXh0OiBcImFhLWNvcmVcIixcbiAgY29sbGFwc2VkOiB0cnVlLFxuICBpdGVtczogW1xuICAgIHtcbiAgICAgIHRleHQ6IFwiR2V0dGluZyBzdGFydGVkXCIsXG4gICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL1wiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJTbWFydCBBY2NvdW50IENsaWVudFwiLFxuICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS9zbWFydC1hY2NvdW50LWNsaWVudC9cIixcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiQ2xpZW50IE1pZGRsZXdhcmVcIixcbiAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvc21hcnQtYWNjb3VudC1jbGllbnQvbWlkZGxld2FyZS9cIixcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiU21hcnQgQWNjb3VudCBBY3Rpb25zXCIsXG4gICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJzZW5kVXNlck9wZXJhdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvc21hcnQtYWNjb3VudC1jbGllbnQvYWN0aW9ucy9zZW5kVXNlck9wZXJhdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJidWlsZFVzZXJPcGVyYXRpb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvYnVpbGRVc2VyT3BlcmF0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25Vc2VyT3BlcmF0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS9zbWFydC1hY2NvdW50LWNsaWVudC9hY3Rpb25zL3NpZ25Vc2VyT3BlcmF0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImVzdGltYXRlVXNlck9wZXJhdGlvbkdhc1wiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvc21hcnQtYWNjb3VudC1jbGllbnQvYWN0aW9ucy9lc3RpbWF0ZVVzZXJPcGVyYXRpb25HYXNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiY2hlY2tHYXNTcG9uc29yc2hpcEVsaWdpYmlsaXR5XCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS9zbWFydC1hY2NvdW50LWNsaWVudC9hY3Rpb25zL2NoZWNrR2FzU3BvbnNvcnNoaXBFbGlnaWJpbGl0eVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJidWlsZFVzZXJPcGVyYXRpb25Gcm9tVHhcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvYnVpbGRVc2VyT3BlcmF0aW9uRnJvbVR4XCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIndhaXRGb3JVc2VyT3BlcmF0aW9uVHJhbnNhY3Rpb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvd2FpdEZvclVzZXJPcGVyYXRpb25UcmFuc2FjdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJkcm9wQW5kUmVwbGFjZVVzZXJPcGVyYXRpb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvZHJvcEFuZFJlcGxhY2VVc2VyT3BlcmF0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldFVzZXJPcGVyYXRpb25CeUhhc2hcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvZ2V0VXNlck9wZXJhdGlvbkJ5SGFzaFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRVc2VyT3BlcmF0aW9uUmVjZWlwdFwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvc21hcnQtYWNjb3VudC1jbGllbnQvYWN0aW9ucy9nZXRVc2VyT3BlcmF0aW9uUmVjZWlwdFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJzZW5kVHJhbnNhY3Rpb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvc2VuZFRyYW5zYWN0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNlbmRUcmFuc2FjdGlvbnNcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvc2VuZFRyYW5zYWN0aW9uc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJyZXF1ZXN0XCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS9zbWFydC1hY2NvdW50LWNsaWVudC9hY3Rpb25zL3JlcXVlc3RcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwic2lnbk1lc3NhZ2VcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvc2lnbk1lc3NhZ2VcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwic2lnblR5cGVkRGF0YVwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvc21hcnQtYWNjb3VudC1jbGllbnQvYWN0aW9ucy9zaWduVHlwZWREYXRhXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25NZXNzYWdlV2l0aDY0OTJcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvc2lnbk1lc3NhZ2VXaXRoNjQ5MlwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJzaWduVHlwZWREYXRhV2l0aDY0OTJcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvc2lnblR5cGVkRGF0YVdpdGg2NDkyXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldEFkZHJlc3NcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L2FjdGlvbnMvZ2V0QWRkcmVzc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJ1cGdyYWRlQWNjb3VudFwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvc21hcnQtYWNjb3VudC1jbGllbnQvYWN0aW9ucy91cGdyYWRlQWNjb3VudFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJUeXBlc1wiLFxuICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlVzZXJPcGVyYXRpb25GZWVPcHRpb25zXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvc21hcnQtYWNjb3VudC1jbGllbnQvdHlwZXMvdXNlck9wZXJhdGlvbkZlZU9wdGlvbnNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiVXNlck9wZXJhdGlvbkZlZU9wdGlvbnNGaWVsZFwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L3R5cGVzL3VzZXJPcGVyYXRpb25GZWVPcHRpb25zRmllbGRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiVXNlck9wZXJhdGlvbk92ZXJyaWRlc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NtYXJ0LWFjY291bnQtY2xpZW50L3R5cGVzL3VzZXJPcGVyYXRpb25PdmVycmlkZXNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkJ1bmRsZXIgQ2xpZW50XCIsXG4gICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL2J1bmRsZXItY2xpZW50L1wiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJCdW5kbGVyIEFjdGlvbnNcIixcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNlbmRSYXdVc2VyT3BlcmF0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS9idW5kbGVyLWNsaWVudC9hY3Rpb25zL3NlbmRSYXdVc2VyT3BlcmF0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImVzdGltYXRlVXNlck9wZXJhdGlvbkdhc1wiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvYnVuZGxlci1jbGllbnQvYWN0aW9ucy9lc3RpbWF0ZVVzZXJPcGVyYXRpb25HYXNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiZ2V0VXNlck9wZXJhdGlvbkJ5SGFzaFwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvYnVuZGxlci1jbGllbnQvYWN0aW9ucy9nZXRVc2VyT3BlcmF0aW9uQnlIYXNoXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldFVzZXJPcGVyYXRpb25SZWNlaXB0XCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS9idW5kbGVyLWNsaWVudC9hY3Rpb25zL2dldFVzZXJPcGVyYXRpb25SZWNlaXB0XCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldFN1cHBvcnRlZEVudHJ5UG9pbnRzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS9idW5kbGVyLWNsaWVudC9hY3Rpb25zL2dldFN1cHBvcnRlZEVudHJ5UG9pbnRzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJBY2NvdW50c1wiLFxuICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS9hY2NvdW50cy9cIixcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiU2lnbmVyc1wiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiV2FsbGV0Q2xpZW50U2lnbmVyXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS9zaWduZXJzL3dhbGxldC1jbGllbnRcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiTG9jYWxBY2NvdW50U2lnbmVyXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS9zaWduZXJzL2xvY2FsLWFjY291bnRcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiVXRpbHNcIixcbiAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJ3cmFwU2lnbmF0dXJlV2l0aDY0OTJcIixcbiAgICAgICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS9zaWduZXJzL3V0aWxzL3dyYXBTaWduYXR1cmVXaXRoNjQ5MlwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJ2ZXJpZnlFSVA2NDkyU2lnbmF0dXJlXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvc2lnbmVycy91dGlscy92ZXJpZnlFSVA2NDkyU2lnbmF0dXJlXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAgeyB0ZXh0OiBcIlNwbGl0IFRyYW5zcG9ydFwiLCBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3NwbGl0LXRyYW5zcG9ydFwiIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJVdGlsc1wiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyB0ZXh0OiBcImFzeW5jUGlwZVwiLCBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3V0aWxzL2FzeW5jUGlwZVwiIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImNvbnZlcnRDaGFpbklkVG9Db2luVHlwZVwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvdXRpbHMvY29udmVydENoYWluSWRUb0NvaW5UeXBlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImNvbnZlcnRDb2luVHlwZVRvQ2hhaW5cIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3V0aWxzL2NvbnZlcnRDb2luVHlwZVRvQ2hhaW5cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiY29udmVydENvaW5UeXBlVG9DaGFpbklkXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS91dGlscy9jb252ZXJ0Q29pblR5cGVUb0NoYWluSWRcIixcbiAgICAgICAgfSxcbiAgICAgICAgeyB0ZXh0OiBcImRlZXBIZXhsaWZ5XCIsIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvdXRpbHMvZGVlcEhleGxpZnlcIiB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJkZWZpbmVSZWFkT25seVwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvdXRpbHMvZGVmaW5lUmVhZE9ubHlcIixcbiAgICAgICAgfSxcbiAgICAgICAgeyB0ZXh0OiBcImdldENoYWluXCIsIGxpbms6IFwiL3BhY2thZ2VzL2FhLWNvcmUvdXRpbHMvZ2V0Q2hhaW5cIiB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXREZWZhdWx0RW50cnlQb2ludEFkZHJlc3NcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1jb3JlL3V0aWxzL2dldERlZmF1bHRFbnRyeVBvaW50QWRkcmVzc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXREZWZhdWx0U2ltcGxlQWNjb3VudEZhY3RvcnlBZGRyZXNzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS91dGlscy9nZXREZWZhdWx0U2ltcGxlQWNjb3VudEZhY3RvcnlBZGRyZXNzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInJlc29sdmVQcm9wZXJ0aWVzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS91dGlscy9yZXNvbHZlUHJvcGVydGllc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJzdHJpbmdUb0luZGV4XCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtY29yZS91dGlscy9zdHJpbmdUb0luZGV4XCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29yay9hYS1zZGsvYWEtc2RrL3NpdGUvc2lkZWJhclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcnVubmVyL3dvcmsvYWEtc2RrL2FhLXNkay9zaXRlL3NpZGViYXIvYWEtZXRoZXJzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3J1bm5lci93b3JrL2FhLXNkay9hYS1zZGsvc2l0ZS9zaWRlYmFyL2FhLWV0aGVycy50c1wiO2ltcG9ydCB7IFNpZGViYXJJdGVtIH0gZnJvbSBcInZvY3NcIjtcblxuZXhwb3J0IGNvbnN0IGFhRXRoZXJzU2lkZWJhcjogU2lkZWJhckl0ZW0gPSB7XG4gIHRleHQ6IFwiYWEtZXRoZXJzXCIsXG4gIGNvbGxhcHNlZDogdHJ1ZSxcbiAgaXRlbXM6IFtcbiAgICB7XG4gICAgICB0ZXh0OiBcIkdldHRpbmcgc3RhcnRlZFwiLFxuICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtZXRoZXJzL1wiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJFdGhlcnNQcm92aWRlckFkYXB0ZXJcIixcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkludHJvZHVjdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWV0aGVycy9wcm92aWRlci1hZGFwdGVyL2ludHJvZHVjdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJjb25zdHJ1Y3RvclwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWV0aGVycy9wcm92aWRlci1hZGFwdGVyL2NvbnN0cnVjdG9yXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNlbmRcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1ldGhlcnMvcHJvdmlkZXItYWRhcHRlci9zZW5kXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImNvbm5lY3RUb0FjY291bnRcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1ldGhlcnMvcHJvdmlkZXItYWRhcHRlci9jb25uZWN0VG9BY2NvdW50XCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldEJ1bmRsZXJDbGllbnRcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1ldGhlcnMvcHJvdmlkZXItYWRhcHRlci9nZXRCdW5kbGVyQ2xpZW50XCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImZyb21FdGhlcnNQcm92aWRlclwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWV0aGVycy9wcm92aWRlci1hZGFwdGVyL2Zyb21FdGhlcnNQcm92aWRlclwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiQWNjb3VudFNpZ25lclwiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtZXRoZXJzL2FjY291bnQtc2lnbmVyL2ludHJvZHVjdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRBZGRyZXNzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtZXRoZXJzL2FjY291bnQtc2lnbmVyL2dldEFkZHJlc3NcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwic2lnbk1lc3NhZ2VcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1ldGhlcnMvYWNjb3VudC1zaWduZXIvc2lnbk1lc3NhZ2VcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwic2VuZFRyYW5zYWN0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtZXRoZXJzL2FjY291bnQtc2lnbmVyL3NlbmRUcmFuc2FjdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRCdW5kbGVyQ2xpZW50XCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtZXRoZXJzL2FjY291bnQtc2lnbmVyL2dldEJ1bmRsZXJDbGllbnRcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiY29ubmVjdFwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWV0aGVycy9hY2NvdW50LXNpZ25lci9jb25uZWN0XCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJVdGlsc1wiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtZXRoZXJzL3V0aWxzL2ludHJvZHVjdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJjb252ZXJ0V2FsbGV0VG9BY2NvdW50U2lnbmVyXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtZXRoZXJzL3V0aWxzL2NvbnZlcnRXYWxsZXRUb0FjY291bnRTaWduZXJcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiY29udmVydEV0aGVyc1NpZ25lclRvQWNjb3VudFNpZ25lclwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLWV0aGVycy91dGlscy9jb252ZXJ0RXRoZXJzU2lnbmVyVG9BY2NvdW50U2lnbmVyXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29yay9hYS1zZGsvYWEtc2RrL3NpdGUvc2lkZWJhclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcnVubmVyL3dvcmsvYWEtc2RrL2FhLXNkay9zaXRlL3NpZGViYXIvYWEtc2lnbmVycy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9ydW5uZXIvd29yay9hYS1zZGsvYWEtc2RrL3NpdGUvc2lkZWJhci9hYS1zaWduZXJzLnRzXCI7aW1wb3J0IHsgU2lkZWJhckl0ZW0gfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgY29uc3QgYWFTaWduZXJzU2lkZWJhcjogU2lkZWJhckl0ZW0gPSB7XG4gIHRleHQ6IFwiYWEtc2lnbmVyc1wiLFxuICBjb2xsYXBzZWQ6IHRydWUsXG4gIGl0ZW1zOiBbXG4gICAge1xuICAgICAgdGV4dDogXCJHZXR0aW5nIHN0YXJ0ZWRcIixcbiAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIk1hZ2ljIFNpZ25lclwiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9tYWdpYy9pbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgeyB0ZXh0OiBcImNvbnN0cnVjdG9yXCIsIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvbWFnaWMvY29uc3RydWN0b3JcIiB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJhdXRoZW50aWNhdGVcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL21hZ2ljL2F1dGhlbnRpY2F0ZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7IHRleHQ6IFwiZ2V0QWRkcmVzc1wiLCBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL21hZ2ljL2dldEFkZHJlc3NcIiB9LFxuICAgICAgICB7IHRleHQ6IFwic2lnbk1lc3NhZ2VcIiwgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9tYWdpYy9zaWduTWVzc2FnZVwiIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25UeXBlZERhdGFcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL21hZ2ljL3NpZ25UeXBlZERhdGFcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiZ2V0QXV0aERldGFpbHNcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL21hZ2ljL2dldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJXZWIzQXV0aCBTaWduZXJcIixcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkludHJvZHVjdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvd2ViM2F1dGgvaW50cm9kdWN0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImNvbnN0cnVjdG9yXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy93ZWIzYXV0aC9jb25zdHJ1Y3RvclwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJhdXRoZW50aWNhdGVcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL3dlYjNhdXRoL2F1dGhlbnRpY2F0ZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRBZGRyZXNzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy93ZWIzYXV0aC9nZXRBZGRyZXNzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25NZXNzYWdlXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy93ZWIzYXV0aC9zaWduTWVzc2FnZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJzaWduVHlwZWREYXRhXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy93ZWIzYXV0aC9zaWduVHlwZWREYXRhXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy93ZWIzYXV0aC9nZXRBdXRoRGV0YWlsc1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiVHVybmtleSBTaWduZXJcIixcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkludHJvZHVjdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvdHVybmtleS9pbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiY29uc3RydWN0b3JcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL3R1cm5rZXkvY29uc3RydWN0b3JcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiYXV0aGVudGljYXRlXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy90dXJua2V5L2F1dGhlbnRpY2F0ZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7IHRleHQ6IFwiZ2V0QWRkcmVzc1wiLCBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL3R1cm5rZXkvZ2V0QWRkcmVzc1wiIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25NZXNzYWdlXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy90dXJua2V5L3NpZ25NZXNzYWdlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25UeXBlZERhdGFcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL3R1cm5rZXkvc2lnblR5cGVkRGF0YVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRBdXRoRGV0YWlsc1wiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvdHVybmtleS9nZXRBdXRoRGV0YWlsc1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiRmlyZWJsb2NrcyBTaWduZXJcIixcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkludHJvZHVjdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvZmlyZWJsb2Nrcy9pbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiY29uc3RydWN0b3JcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2ZpcmVibG9ja3MvY29uc3RydWN0b3JcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiYXV0aGVudGljYXRlXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9maXJlYmxvY2tzL2F1dGhlbnRpY2F0ZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRBZGRyZXNzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9maXJlYmxvY2tzL2dldEFkZHJlc3NcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwic2lnbk1lc3NhZ2VcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2ZpcmVibG9ja3Mvc2lnbk1lc3NhZ2VcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwic2lnblR5cGVkRGF0YVwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvZmlyZWJsb2Nrcy9zaWduVHlwZWREYXRhXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9maXJlYmxvY2tzL2dldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJDYXBzdWxlIFNpZ25lclwiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9jYXBzdWxlL2ludHJvZHVjdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJjb25zdHJ1Y3RvclwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvY2Fwc3VsZS9jb25zdHJ1Y3RvclwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJhdXRoZW50aWNhdGVcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2NhcHN1bGUvYXV0aGVudGljYXRlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHsgdGV4dDogXCJnZXRBZGRyZXNzXCIsIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvY2Fwc3VsZS9nZXRBZGRyZXNzXCIgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwic2lnbk1lc3NhZ2VcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2NhcHN1bGUvc2lnbk1lc3NhZ2VcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwic2lnblR5cGVkRGF0YVwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvY2Fwc3VsZS9zaWduVHlwZWREYXRhXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9jYXBzdWxlL2dldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJQYXJ0aWNsZSBTaWduZXJcIixcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkludHJvZHVjdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvcGFydGljbGUvaW50cm9kdWN0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImNvbnN0cnVjdG9yXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wYXJ0aWNsZS9jb25zdHJ1Y3RvclwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJhdXRoZW50aWNhdGVcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL3BhcnRpY2xlL2F1dGhlbnRpY2F0ZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRBZGRyZXNzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wYXJ0aWNsZS9nZXRBZGRyZXNzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25NZXNzYWdlXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wYXJ0aWNsZS9zaWduTWVzc2FnZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJzaWduVHlwZWREYXRhXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wYXJ0aWNsZS9zaWduVHlwZWREYXRhXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wYXJ0aWNsZS9nZXRBdXRoRGV0YWlsc1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiUG9ydGFsIFNpZ25lclwiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wb3J0YWwvaW50cm9kdWN0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImNvbnN0cnVjdG9yXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wb3J0YWwvY29uc3RydWN0b3JcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiYXV0aGVudGljYXRlXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wb3J0YWwvYXV0aGVudGljYXRlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHsgdGV4dDogXCJnZXRBZGRyZXNzXCIsIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvcG9ydGFsL2dldEFkZHJlc3NcIiB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJzaWduTWVzc2FnZVwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvcG9ydGFsL3NpZ25NZXNzYWdlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25UeXBlZERhdGFcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL3BvcnRhbC9zaWduVHlwZWREYXRhXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wb3J0YWwvZ2V0QXV0aERldGFpbHNcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkFyY2FuYSBBdXRoIFNpZ25lclwiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9hcmNhbmEtYXV0aC9pbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiY29uc3RydWN0b3JcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2FyY2FuYS1hdXRoL2NvbnN0cnVjdG9yXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImF1dGhlbnRpY2F0ZVwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvYXJjYW5hLWF1dGgvYXV0aGVudGljYXRlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldEFkZHJlc3NcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2FyY2FuYS1hdXRoL2dldEFkZHJlc3NcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwic2lnbk1lc3NhZ2VcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2FyY2FuYS1hdXRoL3NpZ25NZXNzYWdlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25UeXBlZERhdGFcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2FyY2FuYS1hdXRoL3NpZ25UeXBlZERhdGFcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiZ2V0QXV0aERldGFpbHNcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2FyY2FuYS1hdXRoL2dldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJMaXQgU2lnbmVyXCIsXG4gICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJJbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2xpdC1wcm90b2NvbC9pbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiY29uc3RydWN0b3JcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2xpdC1wcm90b2NvbC9jb25zdHJ1Y3RvclwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJhdXRoZW50aWNhdGVcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2xpdC1wcm90b2NvbC9hdXRoZW50aWNhdGVcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiZ2V0QWRkcmVzc1wiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvbGl0LXByb3RvY29sL2dldEFkZHJlc3NcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwic2lnbk1lc3NhZ2VcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2xpdC1wcm90b2NvbC9zaWduTWVzc2FnZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJzaWduVHlwZWREYXRhXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9saXQtcHJvdG9jb2wvc2lnblR5cGVkRGF0YVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRBdXRoRGV0YWlsc1wiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvbGl0LXByb3RvY29sL2dldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJQYXNzcG9ydCBTaWduZXJcIixcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkludHJvZHVjdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvcGFzc3BvcnQvaW50cm9kdWN0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImNvbnN0cnVjdG9yXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wYXNzcG9ydC9jb25zdHJ1Y3RvclwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJhdXRoZW50aWNhdGVcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL3Bhc3Nwb3J0L2F1dGhlbnRpY2F0ZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRBZGRyZXNzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wYXNzcG9ydC9nZXRBZGRyZXNzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25NZXNzYWdlXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wYXNzcG9ydC9zaWduTWVzc2FnZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJzaWduVHlwZWREYXRhXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wYXNzcG9ydC9zaWduVHlwZWREYXRhXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcImdldEF1dGhEZXRhaWxzXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9wYXNzcG9ydC9nZXRBdXRoRGV0YWlsc1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiRm9yZGVmaSBTaWduZXJcIixcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkludHJvZHVjdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvZm9yZGVmaS9pbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiY29uc3RydWN0b3JcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2ZvcmRlZmkvY29uc3RydWN0b3JcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiYXV0aGVudGljYXRlXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9mb3JkZWZpL2F1dGhlbnRpY2F0ZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7IHRleHQ6IFwiZ2V0QWRkcmVzc1wiLCBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2ZvcmRlZmkvZ2V0QWRkcmVzc1wiIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25NZXNzYWdlXCIsXG4gICAgICAgICAgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9mb3JkZWZpL3NpZ25NZXNzYWdlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInNpZ25UeXBlZERhdGFcIixcbiAgICAgICAgICBsaW5rOiBcIi9wYWNrYWdlcy9hYS1zaWduZXJzL2ZvcmRlZmkvc2lnblR5cGVkRGF0YVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJnZXRBdXRoRGV0YWlsc1wiLFxuICAgICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL2FhLXNpZ25lcnMvZm9yZGVmaS9nZXRBdXRoRGV0YWlsc1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHsgdGV4dDogXCJDb250cmlidXRpbmdcIiwgbGluazogXCIvcGFja2FnZXMvYWEtc2lnbmVycy9jb250cmlidXRpbmdcIiB9LFxuICBdLFxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQ0UsU0FBVztBQUFBLE1BQ1gsU0FBVztBQUFBLE1BQ1gsV0FBYTtBQUFBLE1BQ2IscUJBQXVCO0FBQUEsTUFDdkIsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLFFBQ1QsU0FBVztBQUFBLFVBQ1QsU0FBVztBQUFBLFFBQ2I7QUFBQSxNQUNGO0FBQUEsTUFDQSxrQkFBb0I7QUFBQSxJQUN0QjtBQUFBO0FBQUE7OztBQ1pBLFNBQVMsb0JBQW9COzs7QUNFdEIsSUFBTSxvQkFBaUM7QUFBQSxFQUM1QyxNQUFNO0FBQUEsRUFDTixXQUFXO0FBQUEsRUFDWCxPQUFPO0FBQUEsSUFDTDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxNQUNF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Q0UsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sV0FBVztBQUFBLE1BQ1gsT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFlBQ0w7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNMO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNMO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFlBQ0w7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxFQUFFLE1BQU0sbUJBQW1CLE1BQU0sb0NBQW9DO0FBQUEsSUFDckU7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNMLEVBQUUsTUFBTSxhQUFhLE1BQU0sb0NBQW9DO0FBQUEsUUFDL0Q7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0EsRUFBRSxNQUFNLGVBQWUsTUFBTSxzQ0FBc0M7QUFBQSxRQUNuRTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBLEVBQUUsTUFBTSxZQUFZLE1BQU0sbUNBQW1DO0FBQUEsUUFDN0Q7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7OztBQzdOTyxJQUFNLGtCQUErQjtBQUFBLEVBQzFDLE1BQU07QUFBQSxFQUNOLFdBQVc7QUFBQSxFQUNYLE9BQU87QUFBQSxJQUNMO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNMO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNMO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNMO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjs7O0FDdkZPLElBQU0sbUJBQWdDO0FBQUEsRUFDM0MsTUFBTTtBQUFBLEVBQ04sV0FBVztBQUFBLEVBQ1gsT0FBTztBQUFBLElBQ0w7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sV0FBVztBQUFBLE1BQ1gsT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQSxFQUFFLE1BQU0sZUFBZSxNQUFNLHlDQUF5QztBQUFBLFFBQ3RFO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0EsRUFBRSxNQUFNLGNBQWMsTUFBTSx3Q0FBd0M7QUFBQSxRQUNwRSxFQUFFLE1BQU0sZUFBZSxNQUFNLHlDQUF5QztBQUFBLFFBQ3RFO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixXQUFXO0FBQUEsTUFDWCxPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNMO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBLEVBQUUsTUFBTSxjQUFjLE1BQU0sMENBQTBDO0FBQUEsUUFDdEU7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sV0FBVztBQUFBLE1BQ1gsT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixXQUFXO0FBQUEsTUFDWCxPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQSxFQUFFLE1BQU0sY0FBYyxNQUFNLDBDQUEwQztBQUFBLFFBQ3RFO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNMO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sV0FBVztBQUFBLE1BQ1gsT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0EsRUFBRSxNQUFNLGNBQWMsTUFBTSx5Q0FBeUM7QUFBQSxRQUNyRTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixXQUFXO0FBQUEsTUFDWCxPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNMO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sV0FBVztBQUFBLE1BQ1gsT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFD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LE1BQ0UsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sT0FBTztBQUFBLFlBQ0wsRUFBRSxNQUFNLGdCQUFnQixNQUFNLGdDQUFnQztBQUFBLFlBQzlEO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQSxFQUFFLE1BQU0sd0JBQXdCLE1BQU0sNEJBQTRCO0FBQUEsVUFDcEU7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixXQUFXO0FBQUEsVUFDWCxPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixXQUFXO0FBQUEsVUFDWCxPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixXQUFXO0FBQUEsVUFDWCxPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixXQUFXO0FBQUEsVUFDWCxPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxFQUFFLE1BQU0sWUFBWSxNQUFNLGtCQUFrQjtBQUFBLFFBQzVDLEVBQUUsTUFBTSxPQUFPLE1BQU0sYUFBYTtBQUFBLFFBQ2xDLEVBQUUsTUFBTSxnQkFBZ0IsTUFB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
