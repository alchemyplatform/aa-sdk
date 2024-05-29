import { defineConfig } from "vocs";

const pkg = require("../lerna.json");

export default defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  logoUrl: "/kit-logo.svg",
  rootDir: "./",
  head: (
    <>
      <meta
        name="google-site-verification"
        content="W4pmFb0Oe26_OndBLdy5uqNrsl_gfmKfTlHwlHPd4Co"
      />
    </>
  ),
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
    // packagesSidebar,
    {
      text: "Resources",
      items: [
        { text: "FAQs", link: "/faqs" },
        { text: "React Native", link: "/react-native" },
        { text: "Terms", link: "/terms" },
        { text: "Types", link: "/types" },
        { text: "Contact us", link: "/contact-us" },
      ],
    },
  ],
  // TODO: add head
  // This is not supported in vocs
  // sitemap: {
  //   hostname: "https://accountkit.alchemy.com",
  // },
});
