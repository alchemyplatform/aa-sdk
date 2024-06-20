import { defineConfig } from "vocs";

const pkg = require("../lerna.json");

export default defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  logoUrl: {
    light: "/account-kit-light-mode.svg",
    dark: "/account-kit-dark-mode.svg",
  },
  iconUrl: "/kit-icon.svg",
  rootDir: "./",
  ogImageUrl: "/images/og-image.jpg",
  head: () => (
    <>
      <script
        src="https://static.alchemyapi.io/scripts/anayltics/alchemy-analytics.js"
        defer
      />
      <link rel="icon" href="/favicon.ico" />
      <meta
        name="google-site-verification"
        content="W4pmFb0Oe26_OndBLdy5uqNrsl_gfmKfTlHwlHPd4Co"
      />
      {/* Open Graph Tags */}
      <meta property="og:title" content="Account Kit"></meta>
      <meta
        property="og:description"
        content="Account Kit is a framework to embed smart accounts in your web3 app, unlocking powerful features like email/social login, gas sponsorship, batched transactions, and more."
      ></meta>
      <meta property="og:image:type" content="image/jpeg"></meta>
      <meta property="og:image:width" content="2400"></meta>
      <meta property="og:image:height" content="1260"></meta>
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image"></meta>
      <meta name="twitter:title" content="Account Kit"></meta>
      <meta
        name="twitter:description"
        content="Account Kit is a framework to embed smart accounts in your web3 app, unlocking powerful features like email/social login, gas sponsorship, batched transactions, and more."
      ></meta>
    </>
  ),
  topNav: [
    { text: "React", link: "/react/overview" },
    { text: "Core", link: "/core/overview" },
    {
      text: "More",
      items: [
        {
          text: "Infra",
          link: "/infra/overview",
        },
        {
          text: "Signer",
          link: "/signer/overview",
        },
        {
          text: "Smart Contracts",
          link: "/smart-contracts/overview",
        },
      ],
    },
    {
      text: "SDK Reference",
      items: [
        { text: "@account-kit/react", link: "/reference/account-kit/react" },
        { text: "@account-kit/core", link: "/reference/account-kit/core" },
        { text: "@account-kit/infra", link: "/reference/account-kit/infra" },
        { text: "@account-kit/signer", link: "/reference/account-kit/signer" },
        {
          text: "@account-kit/smart-contracts",
          link: "/reference/account-kit/smart-contracts",
        },
        { text: "@aa-sdk/core", link: "/reference/aa-sdk/core" },
        { text: "@aa-sdk/ethers", link: "/reference/aa-sdk/ethers" },
      ],
    },
    {
      text: pkg.version,
      items: [
        {
          text: "Migrating to 4.x.x",
          link: "/migration-guide",
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
  sidebar: {
    "/react": [
      { text: "Overview", link: "/react/overview" },
      { text: "SSR", link: "/react/ssr" },
      { text: "createConfig", link: "/react/createConfig" },
      {
        text: "React Hooks",
        items: [
          { text: "useAuthenticate", link: "/react/useAuthenticate" },
          {
            text: "useSmartAccountClient",
            link: "/react/useSmartAccountClient",
          },
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
    ],
    "/core": [],
    "/infra": [],
    "/signer": [],
    "/smart-contracts": [],
    "/reference/account-kit/react": [],
    "/reference/account-kit/core": [],
    "/reference/account-kit/infra": [],
    "/reference/account-kit/signer": [],
    "/reference/account-kit/smart-contracts": [],
    "/reference/aa-sdk/core": [],
    "/reference/aa-sdk/ethers": [],
    "/intro": [],
  },
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
