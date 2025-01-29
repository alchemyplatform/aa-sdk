import ts from "typescript";
import { defineConfig } from "vocs";
import { indexSidebar } from "./sidebar/index.js";
import { aaSdkCoreReferenceSidebar } from "./sidebar/reference/aa-sdk/core.js";
import { aaSdkEthersReferenceSidebar } from "./sidebar/reference/aa-sdk/ethers.js";
import { accountKitCoreReferenceSidebar } from "./sidebar/reference/account-kit/core.js";
import { accountKitInfraReferenceSidebar } from "./sidebar/reference/account-kit/infra.js";
import { accountKitReactReferenceSidebar } from "./sidebar/reference/account-kit/react.js";
import { accountKitSignerReferenceSidebar } from "./sidebar/reference/account-kit/signer.js";
import { accountKitSmartContractsReferenceSidebar } from "./sidebar/reference/account-kit/smart-contracts.js";

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
  head: (
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
    {
      text: "Guides",
      items: [
        { text: "React", link: "/react/overview" },
        { text: "Core", link: "/core/overview" },
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
    "/": indexSidebar(),
    "/react": indexSidebar("react"),
    "/react-native": indexSidebar("react-native"),
    "/core": indexSidebar("core"),
    "/infra": indexSidebar("infra"),
    "/signer": indexSidebar("signer"),
    "/smart-contracts": indexSidebar("contracts"),
    "/reference/account-kit/react": {
      items: accountKitReactReferenceSidebar,
      backLink: true,
    },
    "/reference/account-kit/core": {
      items: accountKitCoreReferenceSidebar,
      backLink: true,
    },
    "/reference/account-kit/infra": {
      items: accountKitInfraReferenceSidebar,
      backLink: true,
    },
    "/reference/account-kit/signer": {
      items: accountKitSignerReferenceSidebar,
      backLink: true,
    },
    "/reference/account-kit/smart-contracts": {
      items: accountKitSmartContractsReferenceSidebar,
      backLink: true,
    },
    "/reference/aa-sdk/core": {
      items: aaSdkCoreReferenceSidebar,
      backLink: true,
    },
    "/reference/aa-sdk/ethers": {
      items: aaSdkEthersReferenceSidebar,
      backLink: true,
    },
  },
  socials: [
    { icon: "github", link: "https://github.com/alchemyplatform/aa-sdk" },
  ],
  theme: {
    accentColor: "#ce26a2",
  },
  vite: {
    build: {
      target: "esnext",
    },
  },
  twoslash: {
    compilerOptions: {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
    },
  },
});
