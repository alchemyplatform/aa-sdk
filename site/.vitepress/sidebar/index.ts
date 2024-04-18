import { DefaultTheme } from "vitepress";
import { packagesSidebar } from "./packages";

export const sidebar: DefaultTheme.Sidebar = [
  {
    text: "Getting started",
    items: [
      {
        text: "Overview",
        link: "/getting-started/overview",
      },
      {
        text: "Quick start",
        base: "/getting-started",
        items: [
          { text: "Introduction", link: "/introduction" },
          {
            text: "Setup",
            link: "/setup-app",
          },
          {
            text: "Log in users",
            link: "/log-in-users",
          },
          { text: "Send user operations", link: "/send-uos" },
        ],
      },
    ],
  },
  {
    text: "Using Alchemy Signer",
    base: "/signers/alchemy-signer",
    items: [
      {
        text: "Introduction",
        link: "/introduction",
      },
      {
        text: "Passkey signup",
        link: "/passkey-signup",
      },
      {
        text: "Passkey authentication",
        link: "/passkey-auth",
      },
      {
        text: "User sessions",
        link: "/manage-user-sessions",
      },
      {
        text: "Export private key",
        link: "/export-private-key",
      },
    ],
  },
  {
    text: "Using smart accounts",
    base: "/using-smart-accounts",
    items: [
      { text: "Send user operations", link: "/send-user-operations" },
      { text: "Batch user operations", link: "/batch-user-operations" },
      {
        text: "Sponsor gas",
        collapsed: false,
        base: "/using-smart-accounts/sponsoring-gas",
        items: [
          { text: "Use the Gas Manager", link: "/gas-manager" },
          { text: "Check eligibility", link: "/checking-eligibility" },
        ],
      },
      { text: "Simulate user operations", link: "/simulate-user-operations" },
      {
        text: "Session keys",
        base: "/using-smart-accounts/session-keys",
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
        base: "/using-smart-accounts/transfer-ownership",
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
        base: "/using-smart-accounts/enhanced-apis",
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
    base: "/react",
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
    ],
  },
  {
    text: "Choosing a smart account",
    items: [
      { text: "Introduction", link: "/smart-accounts/" },
      {
        text: "Modular Account",
        collapsed: false,
        base: "/smart-accounts/modular-account",
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
            base: "/smart-accounts/modular-account/multisig-plugin",
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
        base: "/smart-accounts/custom",
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
    base: "/extending-smart-accounts",
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
    base: "/signers",
    items: [
      { text: "Introduction", link: "/choosing-a-signer" },
      {
        text: "Third-party signers",
        base: "/signers/guides",
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
          { text: "Particle Network", link: "/particle-network" },
          { text: "Arcana Auth", link: "/arcana-auth" },
          { text: "Dfns", link: "/dfns" },
          { text: "WalletKit", link: "/walletkit" },
          { text: "Passport", link: "/passport" },
          { text: "Fordefi", link: "/fordefi" },
        ],
      },
      { text: "EOA signer", link: "/eoa" },
      {
        text: "Build your own",
        link: "/guides/custom-signer",
      },
      {
        text: "Contribute your signer",
        link: "/contributing",
      },
    ],
  },

  {
    text: "Custom infra",
    base: "/third-party",
    items: [
      { text: "Use custom bundler", link: "/bundlers" },
      { text: "Use custom paymaster", link: "/paymasters" },
    ],
  },
  packagesSidebar,
  {
    text: "Resources",
    base: "/resources",
    items: [
      { text: "FAQs", link: "/faqs" },
      { text: "React Native", link: "/react-native" },
      { text: "Terms", link: "/terms" },
      { text: "Types", link: "/types" },
      { text: "Contact us", link: "/contact-us" },
    ],
  },
];
