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
        { text: "Send user operations", link: "/send-user-operations" },
        { text: "Batch user operations", link: "/batch-user-operations" },
        {
          text: "Sponsor gas",
          collapsed: false,
          items: [
            { text: "Use the Gas Manager", link: "/gas-manager" },
            { text: "Check eligibility", link: "/checking-eligibility" },
          ],
        },
        { text: "Simulate user operations", link: "/simulate-user-operations" },
        {
          text: "Session keys",
          collapsed: false,
          items: [
            {
              text: "Overview",
              link: "/",
            },
            {
              text: "Getting started",
              link: "/getting-started",
            },
          ],
        },
        {
          text: "Transfer ownership",
          collapsed: false,
          items: [
            { text: "Modular Account", link: "/modular-account" },
            { text: "Light Account", link: "/light-account" },
            {
              text: "Multi-Owner Light Account",
              link: "/multi-owner-light-account",
            },
          ],
        },
        {
          text: "Alchemy enhanced APIs",
          collapsed: false,
          items: [
            {
              text: "Get account NFTs",
              link: "/nft",
            },
            { text: "Get account tokens", link: "/token" },
          ],
        },
        {
          text: "Update to EntryPoint v0.7",
          link: "/entry-point-v7",
        },
      ],
    },
    {
      text: "React Hooks",
      items: [
        { text: "Overview", link: "/overview" },
        { text: "SSR", link: "/ssr" },
        { text: "createConfig", link: "/createConfig" },
        { text: "useAuthenticate", link: "/useAuthenticate" },
        { text: "useSmartAccountClient", link: "/useSmartAccountClient" },
        { text: "useClientActions", link: "/useClientActions" },
        { text: "useAccount", link: "/useAccount" },
        { text: "useSigner", link: "/useSigner" },
        { text: "useSignerStatus", link: "/useSignerStatus" },
        { text: "useUser", link: "/useUser" },
        { text: "useBundlerClient", link: "/useBundlerClient" },
        { text: "useAddPasskey", link: "/useAddPasskey" },
        { text: "useLogout", link: "/useLogout" },
        { text: "useExportAccount", link: "/useExportAccount" },
        { text: "useSignMessage", link: "/useSignMessage" },
        { text: "useSignTypedData", link: "/useSignTypedData" },
        { text: "useSendUserOperation", link: "/useSendUserOperation" },
        {
          text: "useDropAndReplaceUserOperation",
          link: "/useDropAndReplaceUserOperation",
        },
        {
          text: "useWaitForUserOperationTransaction",
          link: "/useWaitForUserOperationTransaction",
        },
        { text: "useSendTransaction", link: "/useSendTransaction" },
        { text: "useSendTransactions", link: "/useSendTransactions" },
        { text: "useChain", link: "/useChain" },
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
            { text: "Introduction", link: "/" },
            { text: "Getting started", link: "/getting-started" },
            { text: "Deployments", link: "/deployments" },
            {
              text: "Upgrading to Modular Account",
              link: "/upgrade-la-to-ma",
            },
            {
              text: "Multisig Plugin",
              collapsed: true,
              items: [
                { text: "Introduction", link: "/index" },
                { text: "Getting started", link: "/getting-started" },
                { text: "Technical details", link: "/technical-details" },
              ],
            },
          ],
        },
        {
          text: "Light Account",
          link: "/smart-accounts/light-account/",
        },
        {
          text: "Multi-Owner Light Account",
          link: "/smart-accounts/multi-owner-light-account/",
        },
        {
          text: "Custom accounts",
          collapsed: true,
          items: [
            { text: "Use your own", link: "/using-your-own" },
            { text: "Contribute your account", link: "/contributing" },
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
          link: "/install-plugins",
        },
        {
          text: "Get installed plugins",
          link: "/get-installed-plugins",
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
        { text: "Use custom bundler", link: "/bundlers" },
        { text: "Use custom paymaster", link: "/paymasters" },
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
